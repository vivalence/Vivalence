import * as ebisu from "$lib/ebisu";

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

    if (unit.memory)
        unit.memory.strength = ebisu.predictRecallNow(unit.memory.state, unit.memory.lastSeen);

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

    if (tag.memory)
        tag.memory.strength = ebisu.predictRecallNow(tag.memory.state, tag.memory.lastSeen);

    return tag;
};

export const getWeakest = (obj, take = null) => {
    let weakestObj = obj.filter((o) => !o.memory);
    if (take) weakestObj = weakestObj.slice(0, take);
    if (!take || weakestObj.length < take) {
        obj = obj.filter((o) => o.memory).sort((a, b) => a.memory.strength - b.memory.strength);

        if (take) obj = obj.slice(0, take - weakestObj.length);
        weakestObj.push(...Obj);
    }
    return weakestObj;
};
// export const getWeakestUnits = (units, take = null) => {let weakestUnits = units.filter((unit) => !unit.memory); if (take) weakestUnits = weakestUnits.slice(0, take); if (!take || weakestUnits.length < take) {units = units .filter((unit) => unit.memory) .sort((a, b) => a.memory.strength - b.memory.strength); if (take) units = units.slice(0, take - weakestUnits.length); weakestUnits.push(...units);} return weakestUnits;};
// export const getWeakestTags = (units, take = null) => {let weakestTags = tags.filter((tag) => !tag.memory); if (take) weakestTags = weakestTags.slice(0, take); if (!take || weakestTags.length < take) {tags = tags .filter((tag) => tag.memory) .sort((a, b) => a.memory.strength - b.memory.strength); if (take) tags = tags.slice(0, take - weakestTags.length); weakestTags.push(...tags);} return weakestTags;};
