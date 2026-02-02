const MAX_ASSERTION_DEPTH = 5;

export function asserter(daemonDie) {
  daemonDie.good.assert = {
    annotation: createAsserter("annotation", daemonDie.good),
    literal: createAsserter("literal", daemonDie.good),
    symbol: createAsserter("symbol", daemonDie.good),
  };
}

function createAsserter(entityType, daemon) {
  return async function assert(entity, processors, depth = 0) {
    if (depth > MAX_ASSERTION_DEPTH) {
      throw new AssertionError(
        `Max assertion depth (${MAX_ASSERTION_DEPTH}) reached for ${entityType}`,
        { entity, depth },
      );
    }

    if (depth > 0) {
      console.log(`[assert.${entityType}] depth: ${depth}`);
    }

    let issues = await daemon.validate[entityType](entity, processors);

    if (issues.length === 0) {
      return issues;
    }

    // console.log("asserter"); console.json({ issues });
    issues = await daemon.kernel.medic.many(issues, { daemon });

    if (issues.length > 0) {
      return issues;
    }

    return await assert(entity, processors, depth + 1);
  };
}

class AssertionError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = "AssertionError";
    this.context = context;
  }
}
