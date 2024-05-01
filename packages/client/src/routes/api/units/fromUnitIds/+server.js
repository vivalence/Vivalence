import { json } from "@sveltejs/kit";

export async function POST({ locals, request }) {
    try {
        const { unitIds = [] } = await request.json();

        const { data: units, error } = await locals.supabase
            .from("Unit")
            .select("*")
            .in("id", unitIds);

        if (error) throw error;
        return json({ data: units, status: 200 });
    } catch (err) {
        console.error(`[ERROR] /api/units/fromUnitIds:\n`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
