export function asserter(rme) {
  const runtime = rme.instance;
  const assert = runtime.assert;

  assert.unit = factory("unit", runtime);
  assert.symbol = factory("symbol", runtime);
  assert.annotation = factory("annotation", runtime);
}

function factory(entityType, runtime) {
  return async (entity, processors, depth = 0) => {
    if (depth > 0) console.log(`[assert.entity ${entityType}] depth`, depth);
    if (depth > 5) throw new Error("Assertion max stack reached");
    let issues = await runtime.validate.entities[entityType](
      entity,
      processors,
    );
    if (issues.length === 0) return issues;
    issues = await runtime.ontology.medic.many(issues, { runtime });
    if (issues.length > 0) return issues;
    return await runtime.assert[entityType](entity, processors, depth++);
  };
}

// assert.unit = async (unit, processors, depth = 0) => {console.log("[assert.unit] depth", depth); if (depth > 5) throw new Error("Assertion max stack reached"); let issues = await runtime.validate.unit(unit, processors); if (issues.length === 0) return issues; issues = await runtime.ontology.remedy.many(issues, { runtime }); if (issues.length > 0) return issues; return await assert.unit(unit, processors, depth++);};
