import { json } from "@sveltejs/kit";
import { getWeakest, getUnitMemory } from "$api/memory/lib";

export async function POST({ fetch, locals, request }) {
    try {
        const { unitIds, take } = await request.json();

        let units = await locals.client("units/fromUnitIds", { unitIds }).ok();

        units = await Promise.all(units.map(getUnitMemory(locals)));
        units = getWeakest(units, take);

        return json({ data: units, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/units/weakest/fromUnitIds:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
