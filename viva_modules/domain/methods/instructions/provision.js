import Mustache from "npm:mustache";
// import { blacklist } from "@vivalence/shared";
import lock from "./lib/lock.js";
import { getTactic, buildRelations } from "./lib/data.js";

import genderNumber from "./test/strategies/gender-number.js";
const FACTORY = genderNumber;

// blacklist
export default async function ({ tacticId, userId = "lj", blacklist = {} }, ctx) {
  const start = performance.now();

  // SETUP BLACKLIST
  // const { data: queue = [] } = await locals.supabase .from("Queue") .select("data") .eq("strategyId", strategyId) .eq("userId", userId);
  // queue.map(({ data }) => {blacklist = blacklist.scopeToBlacklist({ blacklist, scope: data.scope });});

  // GET DATA
  const tactic = await getTactic(tacticId, ctx);
  const relations = buildRelations(tactic, ctx);
  const inputs = {
    language: { learning: "spanish", spoken: "english" }, // should be from runtime. runtime.static? runtime.corpus.manifest?
    tactic,
    ...relations,
  };

  const factory = FACTORY || new Function(`return ${tactic.instructions.factory}`)();
  const instructions = await factory(inputs, ctx.runtime);

  const end = performance.now();
  console.log(`PROVISIONING ${instructions.length}  took ${(end - start) / 1000} seconds`);
  return instructions;
}

// locals.Mustache = Mustache;
// locals.ebisu = ebisu;
// locals.shuffle = lib.shuffleArray;
