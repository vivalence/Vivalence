import { pos } from "$classifier/ontology";

export default async function (unit, locals) {
    const { constraints } = pos[unit.annotation.pos];
    const issues = [];

    for (const [branch, leaf] of Object.entries(unit.annotation)) {
        if (branch === "lemma") continue;
        const ontology = { branch: branch, leaf: leaf };
        const requiredTags = unit.tags.filter((tag) => tag.branch === branch && tag.leaf === leaf);
        if (requiredTags.length === 0) {
            issues.push({
                message: `Required tag with branch: '${branch}' and leaf: '${leaf}' missing.`,
                path: ["unit", "tag"],
                violation: "required",
                context: { ontology, test: { required: ontology } }
            });
        }
    }

    if (issues.length === 0) {
        for (const constraint of constraints) {
            issues.push(...validate(constraint, unit));
        }
    }

    return {
        isValid: issues.length === 0,
        issues
    };
}

function validate(test, unit) {
    const issues = [];
    const tags = unit.tags;

    if (test.required) {
        // test if the required tag is present
        const required = tags.filter((tag) => {
            return (
                (!test.required.branch || tag.branch === test.required.branch) &&
                (!test.required.leaf || tag.leaf === test.required.leaf)
            );
        });
        if (required.length < 1) {
            issues.push({
                message: `Required tag with branch: '${test.required.branch}'${test.required.leaf ? ` and leaf: '${test.required.leaf}'` : ""} missing.`,
                path: ["unit", "tag"],
                violation: "required",
                context: { test }
            });
        }
    } else if (test.unique) {
        const unique = tags.filter((tag) => {
            return (
                (!test.unique.branch || tag.branch === test.unique.branch) &&
                (!test.unique.leaf || tag.leaf === test.unique.leaf)
            );
        });
        if (unique.length > 1) {
            issues.push({
                message: `There must be no more than one tag with branch '${test.unique.branch || ""}'${test.unique.leaf ? ` and leaf '${test.unique.leaf}'` : ""}.`,
                path: ["unit", "tag"],
                violation: "unique",
                context: { test }
            });
        }
    } else if (test.forbidden) {
        const forbidden = tags.filter((tag) => {
            return (
                (!test.forbidden.branch || tag.branch === test.forbidden.branch) &&
                (!test.forbidden.leaf || tag.leaf === test.forbidden.leaf)
            );
        });
        if (forbidden.length > 0) {
            issues.push({
                message: `Forbidden Tag with branch '${test.forbidden.branch || ""}'${test.forbidden.leaf ? ` and leaf '${test.forbidden.leaf}'` : ""} found.`,
                path: ["unit", "tag"],
                violation: "forbidden",
                context: { test }
            });
        }
    } else if (test.some) {
        const tests = test.some.map((t) => {
            return validate(t, unit).map((error) => {
                error.context.ancestor = error.context.ancestor
                    ? [...error.context.ancestor, test]
                    : [test];
                return error;
            });
        });

        if (tests.every((e) => e.length > 0)) {
            tests.forEach((e) => issues.push(...e));
        }
    } else if (test.condition) {
        const conditionMet = validate(test.condition.if, unit).length === 0;

        const testsToValidate = conditionMet ? test.condition.then : test.condition.else;

        if (testsToValidate) {
            testsToValidate.forEach((t) => {
                const nestedIssues = validate(t, unit).map((error) => {
                    error.context.ancestor = error.context.ancestor
                        ? [...error.context.ancestor, test]
                        : [test];
                    return error;
                });

                issues.push(...nestedIssues);
            });
        }
    } else {
        throw new Error(`[UNKNOWN RELATION CONSTRAINT]: ${JSON.stringify(test)}`);
    }

    return issues;
}
