import { json } from "@sveltejs/kit";
import { getUnitMemory } from "../../lib";

export async function POST({ fetch, locals, request }) {
    try {
        let { units, take } = await request.json();

        units = await Promise.all(units.map(getUnitMemory(locals)));

        let weakestUnits = units.filter((unit) => !unit.memory);

        if (take) weakestUnits = weakestUnits.slice(0, take);
        if (!take || weakestUnits.length < take) {
            units = units
                .filter((unit) => unit.memory)
                .sort((a, b) => a.memory.strength - b.memory.strength);

            if (take) units = units.slice(0, take - weakestUnits.length);
            weakestUnits.push(...units);
        }

        return json({ data: weakestUnits, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/memory/weakest/units:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
