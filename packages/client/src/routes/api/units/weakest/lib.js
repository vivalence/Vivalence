import * as ebisu from "$lib/ebisu";

export const getMemory = (locals) => async (unit) => {
    const { data, error } = await locals.supabase
        .from("Unit")
        .select(`id, Memory (id, tagId, unitId, state, status, lastSeen)`)
        .eq("id", unit.id)
        .filter("Memory.tagId", "is", null)
        .single();
    // .filter("_TagToUnit.Tag.Memory.unitId", "is", unit.id) _TagToUnit(*, Tag: A (*, Memory (id, tagId, unitId, state, status, lastSeen))),
    if (error) throw error; // TODO: not handling this RN
    unit = { ...unit, memory: data.Memory[0] };
    delete unit.Memory;

    if (unit.memory)
        unit.memory.strength = ebisu.predictRecallNow(unit.memory.state, unit.memory.lastSeen);
    return unit;
};

export const getWeakest =
    (locals) =>
    async (units, take = null) => {
        units = await Promise.all(units.map(getMemory(locals)));
        let weakestUnits = units.filter((unit) => !unit.memory);

        if (take) weakestUnits = weakestUnits.slice(0, take);
        if (!take || weakestUnits.length < take) {
            units = units
                .filter((unit) => unit.memory)
                .sort((a, b) => a.memory.strength > b.memory.strength);
            if (take) units = units.slice(0, take - weakestUnits.length);
            weakestUnits.push(...units);
        }
        return weakestUnits;
    };
