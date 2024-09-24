import { getDateTimeInXHours, getTimeDifferenceFromNow } from "./time.js";
import * as ebisu from "./ebisu.js";

export async function handleMemory({ scope, gameType, response }, ctx) {
  const user = await ctx.runtime.locals.getUser();
  scope.user = { id: user.id };

  const memory = await findMemory({ scope, gameType, response }, ctx);

  if (!memory) {
    return await createNewMemory({ scope, gameType, response }, ctx);
  } else {
    return await updateMemory({ memory, gameType, response }, ctx);
  }
}

export async function findMemory({ scope }, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Memory")
    .select("id, runtimeId, unitId, tagId, userId, state, status, lastSeen, history")
    .eq("userId", scope.user.id)
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (scope.unit) query = query.eq("unitId", scope.unit.id);
  else query = query.filter("unitId", "is", null);

  if (scope.tag) query = query.eq("tagId", scope.tag.id);
  else query = query.filter("tagId", "is", null);

  const { data: memories, error } = await query.limit(1);
  if (error) throw error;

  return memories[0];
}

export async function createNewMemory({ response, gameType, scope }, ctx) {
  const model = ebisu.initiateModel(response);
  const nextReviewTime = ebisu.predictNextReviewTime(model);
  const nextPlay = getDateTimeInXHours(nextReviewTime);
  const now = new Date().toISOString();

  const history = [{ gameType, response, model, nextPlay, date: now }];
  const status = getStatus(nextReviewTime, history);

  const { data: createdMemory, error } = await ctx.runtime.locals.supabase
    .from("Memory")
    .insert([
      {
        type: "EBISU_v2",
        status,
        state: model,
        lastSeen: now,
        history,
        runtimeId: ctx.runtime.manifest.id,
        userId: scope.user.id,
        unitId: scope.unit?.id,
        tagId: scope.tag?.id,
      },
    ])
    .single()
    .select("id, state, status, lastSeen");

  if (error) throw error;

  return {
    memory: createdMemory,
    nextPlay,
  };
}

export async function updateMemory({ memory, response, gameType }, ctx) {
  const now = new Date().toISOString();
  const elapsedTime = getTimeDifferenceFromNow(memory.lastSeen);
  const model = ebisu.updateModel(memory.state, response, elapsedTime);
  const nextReviewIn = ebisu.predictNextReviewTime(model);
  const nextPlay = getDateTimeInXHours(nextReviewIn);

  const history = [...memory.history, { gameType, response, model, nextPlay, date: now }];
  const status = getStatus(nextReviewIn, history);

  const { data: updatedMemory, error } = await ctx.runtime.locals.supabase
    .from("Memory")
    .update({
      state: model,
      status,
      history,
      lastSeen: now,
      updatedAt: now,
    })
    .eq("id", memory.id)
    .single()
    .select("id, state, status, lastSeen");

  if (error) throw error;

  return {
    memory: updatedMemory,
    nextReviewIn,
    nextPlay,
    memoryStatusChange: status !== memory.status,
  };
}

export async function getUnitMemory(unit, ctx) {
  const { data, error } = await ctx.runtime.locals.supabase
    .from("Unit")
    .select(`id, Memory (id, tagId, unitId, state, status, lastSeen)`)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", unit.id)
    .filter("Memory.tagId", "is", null)
    .single();

  if (error) throw error; // TODO: not handling this RN
  unit = { ...unit, memory: data.Memory[0] };
  delete unit.Memory;

  if (unit.memory) {
    unit.memory.strength = ebisu.predictRecallNow(unit.memory.state, unit.memory.lastSeen);
  }

  return unit;
}

export async function getTagMemory(tag, ctx) {
  const { data, error } = await ctx.runtime.locals.supabase
    .from("Tag")
    .select(`id, Memory (id, tagId, unitId, state, status, lastSeen)`)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", tag.id)
    .filter("Memory.unitId", "is", null)
    .single();

  if (error) throw error;
  tag = { ...tag, memory: data.Memory[0] };
  delete tag.Memory;

  if (tag.memory) {
    tag.memory.strength = ebisu.predictRecallNow(tag.memory.state, tag.memory.lastSeen);
  }

  return tag;
}

export const getWeakest = (resources, take = null) => {
  let resourcesWeakest = resources.filter((o) => !o.memory);
  if (take) resourcesWeakest = resourcesWeakest.slice(0, take);
  if (!take || resourcesWeakest.length < take) {
    resources = resources
      .filter((o) => o.memory)
      .sort((a, b) => a.memory.strength - b.memory.strength);
    if (take) resources = resources.slice(0, take - resourcesWeakest.length);
    resourcesWeakest.push(...resources);
  }
  return resourcesWeakest;
};

export const sortByMemory = (a, b) => {
  if (!a.memory && !b.memory) return 0;
  if (!a.memory) return 1;
  if (!b.memory) return -1;
  return b.memory.strength - a.memory.strength;
};

export const sortResourcesByMemory = (resources) => {
  return resources.sort(sortByMemory);
};

export const getStatus = (nextReviewIn, history) => {
  const checkLastResponses = (n, condition) => {
    const recentResponses = history.slice(-n).map((entry) => entry.response);
    return recentResponses.every((response) => condition.includes(response));
  };

  const isUnknown = nextReviewIn < 1 || checkLastResponses(3, ["UNKNOWN"]);
  const isLearning = nextReviewIn >= 1;
  const isKnown = nextReviewIn > 24 * 7 && checkLastResponses(3, ["KNOWN", "GRADUATE"]);
  const isGraduated = nextReviewIn > 24 * 14 && checkLastResponses(5, ["KNOWN", "GRADUATE"]);

  if (isUnknown) {
    return "UNKNOWN";
  } else if (isGraduated) {
    return "GRADUATED";
  } else if (isKnown) {
    return "KNOWN";
  } else if (isLearning) {
    return "LEARNING";
  }

  return "UNKNOWN";
};
