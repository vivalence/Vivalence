import config from "@vivalence/config";
import { blacklist as Blacklist, deepMerge } from "@vivalence/shared";

import lock from "./lib/lock.js";

export default async function ({ take, ...body }, ctx) {
  let status = "success";
  const user = await ctx.runtime.services.identity.getUser();

  let query = ctx.runtime.services.supabase.from("Dependency").select("*");
  if (body.dependency.id) query = query.eq("id", body.dependency.id);
  if (body.dependency.slug) query = query.eq("slug", body.dependency.slug);
  const { data: dependency, error } = await query.single();

  const tactic = await ctx.runtime.call(`/tactics/fromSlug`, {
    slug: dependency.itinerary.tactic.slug,
  });

  let blacklist = Blacklist.init(body.blacklist);

  let scope = {
    user: { id: user.id },
    runtime: { id: ctx.runtime.manifest.id },
    dependency: { id: dependency.id },
    tactic: { id: tactic.id },
  };

  const counted = await count({ scope, blacklist }, ctx);
  const instructions = await read({ scope, blacklist, take }, ctx);

  if (counted <= take || counted <= config.env.get("PROVISION_THRESHOLD")) {
    status = "provisioning";
    provision({ dependency, tactic, scope, blacklist }, ctx);
  }

  return { instructions, status };
}

async function count({ scope, blacklist }, ctx) {
  const result = await ctx.runtime.services.supabase
    .from("Queue")
    .select("id", { count: "exact" })

    .eq("status", "PENDING")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("userId", scope.user?.id)
    .eq("dependencyId", scope.dependency?.id)
    .eq("tacticId", scope.tactic?.id)
    .not("id", "in", `(${blacklist.queue.join(",")})`);

  if (result.error) {
    console.error("Error retrieving the oldest pending entry:", result.error);
    return { error: result.error, status: "error" };
  }
  return result.count;
}

async function read({ scope, blacklist, take }, ctx) {
  const { data, error } = await ctx.runtime.services.supabase
    .from("Queue")
    .select("id,data")
    .not("id", "in", `(${blacklist.queue.join(",")})`)
    // .eq("status", "PENDING") .eq("tacticId", scope.tactic?.id) .eq("gameId", scope.game?.id)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("userId", scope.user?.id)
    .eq("dependencyId", scope.dependency?.id)
    .eq("tacticId", scope.tactic?.id)
    .order("createdAt", { ascending: true })
    .order("index", { ascending: true })
    .limit(take);

  if (error) {
    console.error("Error retrieving the oldest pending entry:", error);
    return { error, status: "error" };
  }
  // TODO: update them to inpgross

  return data.map((u) => {
    u.data.scope = { ...u.data.scope, queue: { id: u.id } };
    return u.data;
  });
}

async function provision({ dependency, tactic, blacklist, scope }, ctx) {
  if (lock.has(scope)) return { status: "locked" };
  lock.set(scope);

  let instructions, error;
  try {
    blacklist = await Blacklist.fromQueue({ blacklist, scope }, ctx);
    const input = { blacklist, scope, tactic: deepMerge(tactic, dependency.itinerary?.tactic) };

    instructions = await ctx.runtime.call(`/tactics/provision`, input);

    if (instructions.length > 0) {
      const inserts = instructions.map((data, index) => ({
        runtimeId: ctx.runtime.manifest.id,
        userId: scope.user.id,
        dependencyId: dependency.id,
        tacticId: tactic.id,
        data,
        index,
      }));
      const insert = await ctx.runtime.services.supabase.from("Queue").insert(inserts);
    }
  } catch (err) {
    console.error(`[PROVISIONING ERROR]`);
    console.error(`[PROVISIONING ERROR] message`, err.message);
    console.error(err);
    console.log("JSON.stringify({ dependency, scope, blacklist })");
    console.log(JSON.stringify({ dependency, scope, blacklist }));
    console.error(`[/PROVISIONING ERROR]`);
    error = error;
  } finally {
    lock.delete(scope);
    if (error) throw error;
    return instructions;
  }
}
