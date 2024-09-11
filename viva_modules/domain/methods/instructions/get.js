import config from "@vivalence/config";
import lock from "./lib/lock.js";
// lock must be databased for scalability. re: stateless runtime

export default async function ({ scope, take, ...body }, ctx) {
  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };
  const blacklist = buildBlacklist(body.blacklist);

  console.log("GET INSTRUCTIONS");
  const { data: instructions, error } = await ctx.runtime.locals.supabase
    .from("Queue")
    .select("*")
    .not("id", "in", `(${blacklist.instructions.join(",")})`)
    .eq("status", "PENDING")
    .eq("userId", scope.user.id)
    .eq("strategyId", scope.strategy.id)
    .eq("tacticId", scope.tactic.id)
    .order("createdAt", { ascending: true })
    .order("index", { ascending: true })
    .limit(take);

  if (error) {
    console.error("Error retrieving the oldest pending entry:", error);
    return {
      error,
      status: 500,
    };
  }
  if (instructions.length < take) {
    provision({ scope, blacklist }, ctx);
    return { message: "Provisioning Instructions", status: 202 };
  }

  blacklist.instructions.push(...instructions.map((u) => u.id));

  const count = await ctx.runtime.locals.supabase
    .from("Queue")
    .select("id", { count: "exact" })
    .eq("userId", scope.user.id)
    .eq("strategyId", scope.strategy.id)
    .eq("tacticId", scope.tactic.id)
    .not("id", "in", `(${blacklist.instructions.join(",")})`);

  if (count.error) {
    console.error("Error retrieving the oldest pending entry:", count.error);
    return {
      error: count.error,
      status: 500,
    };
  }
  if (count.count < config.env.get("PROVISION_THRESHOLD")) {
    provision({ scope, blacklist }, ctx);
  }

  return { instructions, status: 200 };
}

async function provision(props, ctx) {
  let instructions, error;
  try {
    if (lock.has(props.scope)) return { status: 202 };
    lock.set(props.scope);
    instructions = await ctx.runtime.call("/instructions/provision", props);
    if (instructions.error) throw instructions.error;

    const { error } = await ctx.runtime.locals.supabase.from("Queue").insert(
      instructions.map((data, index) => ({
        userId: props.scope.user.id,
        strategyId: props.scope.strategy.id,
        tacticId: props.scope.tactic.id,
        data,
        index,
      })),
    );

    if (error) throw error;
  } catch (err) {
    console.error(`[PROVISIONING ERROR]`, err.message);
    console.error(err);
    error = error;
  } finally {
    lock.delete(props.scope);
    if (error) throw error;
    return instructions;
  }
}

function buildBlacklist(blacklist = {}) {
  blacklist.units = blacklist.units || [];
  blacklist.tags = blacklist.tags || [];
  blacklist.instructions = blacklist.instructions || [];
  return blacklist;
}
