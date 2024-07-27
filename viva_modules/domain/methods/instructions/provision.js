import Mustache from "npm:mustache";
import { blacklist } from "@vivalence/shared";
import lock from "./lib/lock.js";

export default async function ({ strategyId, userId, blacklist }, runtime) {
  try {
    const start = performance.now();

    // SETUP BLACKLIST
    const { data: queue = [] } = await locals.supabase
      .from("Queue")
      .select("data")
      .eq("strategyId", strategyId)
      .eq("userId", userId);

    queue.map(({ data }) => {
      blacklist = blacklist.scopeToBlacklist({ blacklist, scope: data.scope });
    });

    // GET DATA
    const { data: strategy, error } = await locals.supabase
      .from("Strategy")
      .select(
        `*,
	_StrategyToGame (Game: A (*)),
	_StrategyToUnit (Unit: B (*)),
	_StrategyToTag (Tag: B (*))`
      )
      .eq("id", strategyId)
      .single();
    if (error) throw error;

    strategy.units = strategy._StrategyToUnit.map(({ Unit }) => Unit);
    strategy.tags = strategy._StrategyToTag.map(({ Tag }) => Tag);
    strategy.games = strategy._StrategyToGame.map(({ Game }) => Game);

    delete strategy._StrategyToUnit;
    delete strategy._StrategyToTag;
    delete strategy._StrategyToGame;

    strategy.relations = strategy.relations.reduce((relations, { key, ...relation }) => {
      relations[key.trim()] = relation.data
        .map((id) => strategy[relation.type].find((obj) => obj.id === id))
        .filter(Boolean);
      return relations;
    }, {});

    const context = {
      blacklist,
      userId,
      strategyId,
      language: { learning: "spanish", spoken: "english" },
    };

    // locals.Mustache = Mustache;
    // locals.ebisu = ebisu;
    // locals.shuffle = lib.shuffleArray;

    const strategyProvisioning = local || new Function(`return ${strategy.provision.run}`)();
    const instructions = await strategyProvisioning({ strategy, ...context }, runtime);

    // PERSIST INSTRUCTIONS
    if (!dry) {
      const insert = await locals.supabase
        .from("Queue")
        .insert(instructions.map((data, index) => ({ userId, strategyId, data, index })));
      if (insert.error) throw insert.error;
    }

    const end = performance.now();
    console.log(`PROVISIONING ${instructions.length}  took ${(end - start) / 1000} seconds`);
    return instructions;
  } catch (error) {
    console.error(`[PROVISIONING ERROR]`, error.message);
    console.error(error);
    // this should throw. but only after lock was released.
  } finally {
    lock.delete({ userId, strategyId });
  }
}
