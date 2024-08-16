// import Mustache from "mustache";
import { blacklist as Blacklist } from "@vivalence/shared";
import lock from "./lib/lock.js";
import getData from "./lib/data.js";

import genderNumber from "./test/strategies/gender-number.js";
const FACTORY = genderNumber;

export default async function ({ scope, blacklist }, ctx) {
  const start = performance.now();
  const user = await ctx.runtime.locals.getUser();

  scope.user = { id: user.id };
  blacklist = await queueToBlacklist({ blacklist, scope }, ctx);

  const { tactic, strategy } = await getData({ scope }, ctx);

  const inputs = {
    language: { learning: "spanish", known: "english" },
    blacklist,
    strategy,
    tactic,
    scope,
  };

  ctx.runtime.locals.blacklist = Blacklist;

  const factory = FACTORY || new Function(`return ${tactic.instructions.factory}`)();
  const instructions = await factory(inputs, ctx.runtime);

  const end = performance.now();
  console.log(`PROVISIONING ${instructions.length}  took ${(end - start) / 1000} seconds`);
  return instructions;
}

async function queueToBlacklist({ blacklist, scope }, ctx) {
  const { data: queue = [] } = await ctx.runtime.locals.supabase
    .from("Queue")
    .select("id, userId, strategyId, tacticId, data")
    .eq("userId", scope.user.id)
    .eq("strategyId", scope.strategy.id)
    .eq("tacticId", scope.tactic.id);

  queue.map(({ data }) => {
    blacklist = Blacklist.fromScope({ blacklist, scope: data.scope });
  });

  return blacklist;
}
