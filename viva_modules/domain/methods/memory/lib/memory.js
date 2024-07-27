import * as ebisu from "./ebisu.js";

export const getUnitMemory = (locals) => async (unit) => {
  const { data, error } = await locals.supabase
    .from("Unit")
    .select(`id, Memory (id, tagId, unitId, state, status, lastSeen)`)
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
};

export const getTagMemory = (locals) => async (tag) => {
  const { data, error } = await locals.supabase
    .from("Tag")
    .select(`id, Memory (id, tagId, unitId, state, status, lastSeen)`)
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
};

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
