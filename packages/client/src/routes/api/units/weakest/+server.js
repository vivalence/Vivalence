import { json } from "@sveltejs/kit";

export async function POST({ fetch, locals, request }) {
    try {
        const { tagIds, blacklist = [], take } = await request.json();

        let { data: units, error } = await post("/api/units/fromTagIds", {
            tagIds,
            blacklist
        });
        if (error) throw error;

        const getMemory = async (unit) => {
            const response = await locals.supabase
                .from("Unit")
                .select(`id, Memory (id, tagId, unitId, state, status, lastSeen)`)
                .eq("id", unit.id)
                .filter("Memory.tagId", "is", null)
                .single();
            // .filter("_TagToUnit.Tag.Memory.unitId", "is", unit.id) _TagToUnit(*, Tag: A (*, Memory (id, tagId, unitId, state, status, lastSeen))),
            if (response.error) throw response.error; // TODO: not handling this RN

            const memory = response.data.Memory[0];
            if (unit.memory)
                unit.memory.strength = locals.ebisu.predictRecallNow(
                    unit.memory.state,
                    unit.memory.lastSeen
                );
            unit = {
                ...unit,
                memory
            };
            return unit;
        };
        units = await Promise.all(units.map(getMemory));

        const weakestUnits = units.filter((unit) => !unit.memory);
        if (take) weakestUnits = weakestUnits.slice(0, take);
        if (!take || weakestUnits.length < take) {
            units = units
                .filter((unit) => unit.memory)
                .sort((a, b) => a.memory.strength > b.memory.strength);
            if (take) units = units.slice(0, take - weakestUnits.length);
            weakestUnits.push(...units);
        }

        return json({ data: weakestUnits, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/units/weakest:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
