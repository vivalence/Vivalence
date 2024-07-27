import config from "@vivalence/config";
import lock from "./lib/lock.js";

// must be databased for scalability re: stateless runtime

function provision(props, runtime) {
  if (lock.has(props)) {
    return { status: 202 };
  } else {
    lock.set(props);
    runtime.call("/instructions/provision", props);
    return { status: 202 };
  }
}

export default async function (body, runtime) {
  const { user } = await runtime.locals.getSession();
  const { strategyId, take, blacklist = {} } = body;

  console.log("getting instructions", userId, strategyId, take, blacklist);

  blacklist.units = blacklist.units || [];
  blacklist.tags = blacklist.tags || [];
  blacklist.instructions = blacklist.instructions || [];

  const nextInstructions = await runtime.locals.supabase
    .from("Queue")
    .select("*")
    .not("id", "in", `(${blacklist.instructions.join(",")})`)
    .eq("userId", user.id)
    .eq("strategyId", strategyId)
    .order("createdAt", { ascending: true })
    .order("index", { ascending: true })
    .limit(take);

  if (nextInstructions.error) {
    console.error("Error retrieving the oldest pending entry:", nextInstructions.error);
    return {
      error: nextInstructions.error,
      status: 500,
    };
  }
  if (nextInstructions.data.length < take) {
    provision({ strategyId, userId: user.id, blacklist }, runtime);
    return {
      message: "provisioning instructions",
      status: 202,
    };
  }
  const queueItems = nextInstructions.data;
  blacklist.instructions.push(...queueItems.map((u) => u.id));

  const count = await runtime.locals.supabase
    .from("Queue")
    .select("id", { count: "exact" })
    .eq("userId", user.id)
    .eq("strategyId", strategyId)
    .not("id", "in", `(${blacklist.instructions.join(",")})`);

  if (count.error) {
    console.error("Error retrieving the oldest pending entry:", count.error);
    return {
      error: count.error,
      status: 500,
    };
  }
  if (count.count < config.env.get("PROVISION_THRESHOLD")) {
    provision({ userId: user.id, strategyId, blacklist }, runtime);
  }

  return queueItems;
}
