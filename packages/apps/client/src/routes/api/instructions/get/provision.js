import Mustache from "mustache";
import { performance } from "perf_hooks";
import * as ebisu from "$lib/ebisu";
import * as lib from "$lib";
import scopeToBlacklist from "$lib/scopeToBlacklist";

const sleep = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

const QueueProvisioningLock = new Map();

export default async (props) => {
  if (QueueProvisioningLock.has(`${props.userId}-${props.strategyId}`)) {
    return { status: 202 };
  } else {
    QueueProvisioningLock.set(`${props.userId}-${props.strategyId}`, new Date());
    make(props);
    return { status: 202 };
  }
};

export const make = async ({
  strategyId,
  userId,
  blacklist,
  locals,
  dry = false,
  local = false,
}) => {
  const start = performance.now();

  try {
    // SETUP BLACKLIST
    const { data: queue = [] } = await locals.supabase
      .from("Queue")
      .select("data")
      .eq("strategyId", strategyId)
      .eq("userId", userId);

    queue.map(({ data }) => {
      blacklist = scopeToBlacklist({ blacklist, scope: data.scope });
    });

    // GET DATA
    const { data: strategy, error } = await locals.supabase
      .from("Strategy")
      .select(
        `*,
                _StrategyToGame (Game: A (*)),
                _StrategyToUnit (Unit: B (*)),
                _StrategyToTag (Tag: B (*))`,
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

    locals.Mustache = Mustache;
    locals.scopeToBlacklist = scopeToBlacklist;
    locals.ebisu = ebisu;
    locals.shuffle = lib.shuffleArray;

    const strategyProvisioning = local || new Function(`return ${strategy.provision.run}`)();
    const instructions = await strategyProvisioning({ locals, strategy, context });

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
  } finally {
    QueueProvisioningLock.delete(`${userId}-${strategyId}`);
  }
};
