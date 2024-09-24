export default async function tags({ unit }, ctx) {
  const pos = unit.annotation.pos;
  const constraints = ctx.runtime.schema.constraints[pos];

  if (unit.tags) {
    for (const [branch, leaf] of Object.entries(unit.annotation)) {
      if (branch === "lemma") continue;
      const issues = validateRelations(unit, { branch, leaf });
      if (issues.length > 0) return issues;
    }

    for (const constraint of constraints) {
      const issues = validateConstraints(constraint, unit);
      if (issues.length > 0) return issues;
    }
  }

  return [];
}

function validateRelations(unit, ontology) {
  const issues = [];

  const requiredTags = unit.tags
    .filter((tag) => tag.traits.includes("ONTOLOGICAL"))
    .filter(
      (tag) =>
        !!ontology.branch &&
        !!ontology.leaf &&
        tag.data.ONTOLOGICAL.branch === ontology.branch &&
        tag.data.ONTOLOGICAL.leaf === ontology.leaf,
    );
  if (requiredTags.length === 0) {
    issues.push({
      message: `Annotation requires tag with branch: '${ontology.branch}' and leaf: '${ontology.leaf}'. Is missing.`,
      path: ["unit", "tag"],
      violation: "required",
      context: { ontology, test: { required: ontology }, unit },
    });
  }

  return issues;
}

// TODO: move to ctx.runtime.locals.validate.constraints
function validateConstraints(test, unit) {
  const issues = [];
  const tags = unit.tags.filter((tag) => tag.traits.includes("ONTOLOGICAL"));

  if (test.required) {
    // test if the required tag is present
    const required = tags.filter((tag) => {
      return (
        (!test.required.branch || tag.data.ONTOLOGICAL.branch === test.required.branch) &&
        (!test.required.leaf || tag.data.ONTOLOGICAL.leaf === test.required.leaf)
      );
    });
    if (required.length < 1) {
      issues.push({
        message: `Required tag with branch: '${test.required.branch}'${
          test.required.leaf ? ` and leaf: '${test.required.leaf}'` : ""
        } missing.`,
        path: ["unit", "tag"],
        violation: "required",
        context: { ...test, test, unit },
      });
    }
  } else if (test.unique) {
    const unique = tags.filter((tag) => {
      return (
        (!test.unique.branch || tag.data.ONTOLOGICAL.branch === test.unique.branch) &&
        (!test.unique.leaf || tag.data.ONTOLOGICAL.leaf === test.unique.leaf)
      );
    });
    if (unique.length > 1) {
      issues.push({
        message: `There must be no more than one tag with branch '${test.unique.branch || ""}'${
          test.unique.leaf ? ` and leaf '${test.unique.leaf}'` : ""
        }.`,
        path: ["unit", "tag"],
        violation: "unique",
        context: { ...test, test, unit },
      });
    }
  } else if (test.forbidden) {
    const forbidden = tags.filter((tag) => {
      return (
        (!test.forbidden.branch || tag.data.ONTOLOGICAL.branch === test.forbidden.branch) &&
        (!test.forbidden.leaf || tag.data.ONTOLOGICAL.leaf === test.forbidden.leaf)
      );
    });
    if (forbidden.length > 0) {
      issues.push({
        message: `Forbidden Tag with branch '${test.forbidden.branch || ""}'${
          test.forbidden.leaf ? ` and leaf '${test.forbidden.leaf}'` : ""
        } found.`,
        path: ["unit", "tag"],
        violation: "forbidden",
        context: { ...test, unit },
      });
    }
  } else if (test.some) {
    const tests = test.some.map((t) => {
      return validateConstraints(t, unit).map((error) => {
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
    const conditionMet = validateConstraints(test.condition.if, unit).length === 0;

    const testsToValidate = conditionMet ? test.condition.then : test.condition.else;

    if (testsToValidate) {
      testsToValidate.forEach((t) => {
        const nestedIssues = validateConstraints(t, unit).map((error) => {
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
