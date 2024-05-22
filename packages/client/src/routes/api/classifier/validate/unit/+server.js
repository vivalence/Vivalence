import { json } from "@sveltejs/kit";

import validateAnnotation from "./annotation.js";
import validateRelations from "./tags.js";
import validatePos from "./pos.js";

export async function POST({ request, locals, ...props }) {
    try {
        const { unit } = await request.json();
        const statement = buildStatement(unit);

        const issues = [];

        const validation = await validatePos(statement);
        if (!validation.isValid) issues.push(...validation.issues);

        if (!issues.length > 0 && statement.annotation) {
            const validation = await validateAnnotation(statement);
            if (!validation.isValid) issues.push(...validation.issues);
        }

        if (!issues.length > 0 && statement.tags) {
            const validation = await validateRelations(statement);
            if (!validation.isValid) issues.push(...validation.issues);
        }

        issues.forEach((issue) => (issue.context.unit = unit));

        return json({
            data: { isValid: issues.length === 0, issues },
            status: 200
        });
    } catch (err) {
        console.error(`[VALIDATE UNIT ERROR /api/classifier/validate/unit]`, err.message);
        console.error(err);
        return json({ status: 500, error: err });
    }
}

function buildStatement(unit) {
    const statement = { id: unit.id };
    if (unit.data.annotation) {
        statement.annotation = unit.data.annotation;
    }
    if (unit.tags) {
        statement.tags = unit.tags
            .filter((tag) => !!tag.data.ONTOLOGICAL?.branch)
            .map((tag) => ({
                branch: tag.data.ONTOLOGICAL.branch,
                leaf: tag.data.ONTOLOGICAL.leaf
            }));
    }

    return statement;
}
