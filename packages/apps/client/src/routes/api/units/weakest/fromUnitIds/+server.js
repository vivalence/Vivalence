import { json } from "@sveltejs/kit";
import { getWeakest } from "../lib";

export async function POST({ fetch, locals, request }) {
    try {
        const { unitIds, take } = await request.json();

        let { data: units, error } = await locals.post("/api/units/fromUnitIds", {
            unitIds
        });
        if (error) throw error;

        const weakestUnits = await getWeakest(locals)(units, take);
        return json({ data: weakestUnits, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/units/weakest/fromUnitIds:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
