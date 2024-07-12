export default async function (unit, locals) {
    const pos = unit.annotation?.pos;
    const issues = [];

    if (!pos) {
        issues.push({
            message: "annotation missing: unit.annotation.pos is required.",
            path: ["unit"],
            violation: "invalid",
            context: { unit }
        });
    }

    if (issues.length === 0 && unit.tags) {
        const tags = unit.tags.filter((t) => t.branch === "pos" && t.leaf !== pos);
        if (tags.length > 0) {
            tags.forEach((tag) => {
                issues.push({
                    message: "Annotation.pos does not match tags.ontological.branch",
                    path: ["unit", "tag"],
                    violation: "forbidden",
                    context: {
                        unit,
                        forbidden: {
                            branch: tag.branch,
                            leaf: tag.leaf
                        }
                    }
                });
            });
        }
    }

    return { isValid: issues.length === 0, issues };
}
