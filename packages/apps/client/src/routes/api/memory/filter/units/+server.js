import { json } from "@sveltejs/kit";
import { getUnitMemory } from "../../lib";

export async function POST({ fetch, locals, request }) {
    try {
        let { units, accept } = await request.json();

        units = await Promise.all(units.map(getUnitMemory(locals)));

        units = units.filter((unit) => {
            if (!unit.memory && accept.includes("UNKNOWN")) return true;
            if (accept.includes(unit.memory.status)) return true;
            return false;
        });

        return json({ data: units, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/memory/filter/units:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
