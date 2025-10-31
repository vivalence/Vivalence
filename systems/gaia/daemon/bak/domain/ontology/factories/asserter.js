export default function asserterFactory(runtime) {
  const assert = {
    unit: null,
    tag: null,
    annotation: null,
  };

  assert.unit = asserter("unit", runtime);
  assert.tag = asserter("tag", runtime);
  assert.annotation = asserter("annotation", runtime);

  runtime.assert = assert;
  return runtime;
}

function asserter(entityType, runtime) {
  return async (entity, processors, depth = 0) => {
    if (depth > 0) console.log(`[assert.entity ${entityType}] depth`, depth);
    if (depth > 5) throw new Error("Assertion max stack reached");
    let issues = await runtime.validate[entityType](entity, processors);
    if (issues.length === 0) return issues;
    issues = await runtime.ontology.remedy.many(issues, { runtime });
    if (issues.length > 0) return issues;
    return await runtime.assert[entityType](entity, processors, depth++);
  };
}

// assert.unit = async (unit, processors, depth = 0) => {console.log("[assert.unit] depth", depth); if (depth > 5) throw new Error("Assertion max stack reached"); let issues = await runtime.validate.unit(unit, processors); if (issues.length === 0) return issues; issues = await runtime.ontology.remedy.many(issues, { runtime }); if (issues.length > 0) return issues; return await assert.unit(unit, processors, depth++);};
