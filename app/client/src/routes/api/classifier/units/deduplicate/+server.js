import { json } from "@sveltejs/kit";

import deduplicate from "./deduplicate.js";

export async function POST({ request, locals, ...props }) {
    try {
        const { unit } = await request.json();
        if (!["pron", "det"].includes(unit.data.annotation.pos)) {
            return {
                isValid: false,
                message: "Unit deduplication not implemented for pos: " + unit.data.annotation.pos
            };
        }
        const issues = [];

        const validation = await deduplicate(unit, locals);
        if (!validation.isValid) issues.push(...validation.issues);
        issues.forEach((issue) => (issue.context.unit = unit));

        return json({
            data: { isValid: issues.length === 0, issues },
            status: 200
        });
    } catch (err) {
        console.error(`[VALIDATE UNIT ERROR /api/classifier/unit/deduplicate]`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}
