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
