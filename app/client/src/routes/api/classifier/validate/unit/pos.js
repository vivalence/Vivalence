import { pos } from "$classifier/ontology";

export default async function (unit, locals) {
    const issues = [];

    if (!unit.annotation?.pos) {
        issues.push({
            message: "annotation missing: unit.annotation.pos is required.",
            path: ["unit", "pos"],
            violation: "required",
            context: { unit }
        });
        return { isValid: false, issues };
    }

    if (issues.length === 0 && unit.tags) {
        const tags = unit.tags.filter((tag) => {
            return (
                tag.branch === "pos" && //
                tag.leaf !== unit.annotation.pos
            );
        });
        if (tags.length > 0) {
            issues.push({
                message: "Annotation.pos does not match tags.ontological.branch",
                path: ["unit", "pos"],
                violation: "mismatch",
                context: { statement: unit }
            });
        }
    }

    return { isValid: issues.length === 0, issues };
}
