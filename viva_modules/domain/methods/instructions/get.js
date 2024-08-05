import config from "@vivalence/config";
import lock from "./lib/lock.js";
// lock must be databased for scalability re: stateless runtime

async function provision(props, runtime) {
  let instructions, error;
  try {
    if (lock.has(props)) return { status: 202 };
    lock.set(props);
    instructions = await runtime.call("/instructions/provision", props);
    const { error } = await ctx.locals.supabase
      .from("Queue")
      .insert(instructions.map((data, index) => ({ userId, strategyId, data, index })));
    if (error) throw error;
  } catch (err) {
    console.error(`[PROVISIONING ERROR]`, err.message);
    console.error(err);
    error = error;
  } finally {
    lock.delete({ userId, tacticId });
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

export default async function (body, runtime) {
  const { user } = await runtime.locals.getSession();
  const { tacticId, strategyId, take } = body;
  const blacklist = ensureBlacklist(body.blacklist);

  console.log("getting instructions", userId, strategyId, take, blacklist);

  const { data: instructions, error } = await runtime.locals.supabase
    .from("Queue")
    .select("*")
    .not("id", "in", `(${blacklist.instructions.join(",")})`)
    .eq("userId", user.id)
    .eq("strategyId", strategyId)
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
    provision({ tacticId, userId: user.id, blacklist }, runtime);
    return {
      message: "provisioning instructions",
      status: 202,
    };
  }

  blacklist.instructions.push(...instructions.map((u) => u.id));

  const count = await runtime.locals.supabase
    .from("Queue")
    .select("id", { count: "exact" })
    .eq("userId", user.id)
    .eq("tacticId", tacticId)
    .not("id", "in", `(${blacklist.instructions.join(",")})`);

  if (count.error) {
    console.error("Error retrieving the oldest pending entry:", count.error);
    return {
      error: count.error,
      status: 500,
    };
  }
  if (count.count < config.env.get("PROVISION_THRESHOLD")) {
    provision({ userId: user.id, tacticId, blacklist }, runtime);
  }

  return instructions;
}
