import { json } from "@sveltejs/kit";
import { handleValidationError } from "./registry.js";
import "./install.js";

export async function POST({ request, locals }) {
    try {
        const { issue } = await request.json();
        if (issue.context.unit) {
            const { data: unit } = await locals.supabase
                .from("Unit")
                .select(`*, _TagToUnit(*, Tag: A (*))`)
                .eq("id", issue.context.unit.id)
                .single();

            issue.context.unit = unit;
            issue.context.unit.tags = unit._TagToUnit.map((r) => r.Tag);
            delete issue.context.unit._TagToUnit;
        }

        const result = await handleValidationError(issue, locals);

        return json({ data: result, status: 200 });
    } catch (err) {
        console.error(`[REMEDY ERROR /api/classifier/remedy]`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
