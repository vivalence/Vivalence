import config from "@vivalence/config";
import { blacklist as Blacklist, deepMerge } from "@vivalence/shared";

import lock from "./lib/lock.js";

export default async function ({ take, ...body }, ctx) {
  let status = "success";
  const user = await ctx.runtime.services.identity.getUser();

  const { data: dependency, error } = await ctx.runtime.services.supabase
    .from("Dependency")
    .select("*")
    .eq("id", body.dependency.id)
    .single();

  let blacklist = Blacklist.init(body.blacklist);
  let scope = {
    user: { id: user.id },
    runtime: { id: ctx.runtime.manifest.id },
    dependency: { id: dependency.id },
  };

  const counted = await count({ scope, blacklist }, ctx);
  const instructions = await read({ scope, blacklist, take }, ctx);

  if (counted <= take || counted <= config.env.get("PROVISION_THRESHOLD")) {
    status = "provisioning";
    provision({ dependency, scope, blacklist }, ctx);
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
    // .eq("tacticId", scope.tactic?.id)
    // .eq("gameId", scope.game?.id)
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

async function provision({ dependency, scope, blacklist }, ctx) {
  if (lock.has(scope)) return { status: "locked" };
  lock.set(scope);

  let instructions, error;
  try {
    const tactic = await ctx.runtime.call(`/tactics/fromSlug`, {
      slug: dependency.itinerary.tactic.slug,
    });

    blacklist = await Blacklist.fromQueue({ blacklist, scope }, ctx);

    const input = { blacklist, scope, tactic: deepMerge(tactic, dependency.itinerary?.tactic) };

    instructions = await ctx.runtime.call(`/tactics/provision`, input);

    if (instructions.length > 0) {
      const queue = await ctx.runtime.services.supabase
        .from("Queue") //
        .insert(
          instructions.map((data, index) => ({
            runtimeId: ctx.runtime.manifest.id,
            userId: scope.user.id,
            dependencyId: dependency.id,
            data,
            index,
          })),
        );
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
