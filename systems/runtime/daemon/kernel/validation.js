export function validation(daemonDie) {
  daemonDie.good.validate = {
    annotation: createAnnotationValidator(daemonDie.good),
    literal: createLiteralValidator(daemonDie.good),
    symbol: createSymbolValidator(daemonDie.good),
    exists: createExistenceValidators(daemonDie.good),
  };
}

function createAnnotationValidator(daemon) {
  return async (annotation, processors = ["SCHEMATIC"]) => {
    // Determine subject type from annotation (typically from 'pos' field)
    const subjectSlug = annotation.pos;
    const branch = subjectSlug ? ["annotation", subjectSlug] : ["annotation"];

    return await runConstraints(daemon, branch, annotation, processors);
  };
}

function createLiteralValidator(daemon) {
  return async (literal, processors = ["SCHEMATIC", "RELATIONAL"]) => {
    const subjectSlug = literal.annotation?.pos;
    const branch = subjectSlug ? ["literal", subjectSlug] : ["literal"];

    return await runConstraints(daemon, branch, literal, processors);
  };
}

function createSymbolValidator(daemon) {
  return async (symbol, processors = ["SCHEMATIC"]) => {
    return await runConstraints(daemon, ["symbol"], symbol, processors);
  };
}

function createExistenceValidators(daemon) {
  return {
    literal: async (query) => {
      const issues = await runConstraints(daemon, ["literal"], query, [
        "EXISTENTIAL",
      ]);
      return issues.length === 0;
    },

    symbol: async (query) => {
      const issues = await runConstraints(daemon, ["symbol"], query, [
        "EXISTENTIAL",
      ]);
      return issues.length === 0;
    },

    annotation: async (annotation) => {
      const issues = await runConstraints(daemon, ["annotation"], annotation, [
        "EXISTENTIAL",
      ]);
      return issues.length === 0;
    },
  };
}

async function runConstraints(daemon, branch, entity, processors) {
  const constraints = daemon.kernel.constraint.matching(branch, processors);

  // Sort: SCHEMATIC first, then others
  const sorted = constraints.sort((a, b) => {
    const aSchema = a.traits.includes("SCHEMATIC") ? -1 : 0;
    const bSchema = b.traits.includes("SCHEMATIC") ? -1 : 0;
    return aSchema - bSchema;
  });

  const issues = [];

  console.log({ constraints, sorted });
  for (const constraint of sorted) {
    const constraintIssues = await constraint.test(entity);
    issues.push(...constraintIssues);

    // If schematic validation fails, skip relational checks
    if (
      constraint.traits.includes("SCHEMATIC") &&
      constraintIssues.length > 0
    ) {
      break;
    }
  }

  return issues;
}
