export default function validationFactory(runtime) {
  const factory = validatorFactory(runtime.ontology.constraint);
  const v = {
    unit: null,
    tag: null,
    annotation: null,
    units: {},
    annotations: {},
  };

  for (const dimension of runtime.ontology.dimension.topographical) {
    const topography = runtime.ontology.topography.findOne(dimension);
    if (!topography) continue;

    v.annotations[topography.slug] = factory(["annotation", topography.slug]);
    v.units[topography.slug] = factory(["unit", topography.slug]);
  }

  v.annotation = (annotation, processors = ["SCHEMATIC"]) => {
    // if (!v.annotations[annotation.pos]) console.log("annotation", annotation);
    return v.annotations[annotation.pos](annotation, processors);
  };

  v.unit = (unit, processors) => {
    return v.units[unit.annotation.pos](unit, processors);
  };

  v.tag = factory(["tag"]);

  v.exists = {
    // tag: async (tag) => {const validate = factory(["tag"]); const issues = await validate(tag, ["EXISTENTIAL"]); return issues.length === 0;},
    unit: async (unit) => {
      const validate = factory(["unit"]);
      const issues = await validate(unit, ["EXISTENTIAL"]);
      return issues.length === 0;
    },
  };

  runtime.validate = v;
  return runtime;
}

const validatorFactory = (allConstraints) => (branch) => {
  const branches = [branch];
  if (branch.length > 1) branches.push([branch[0]]);

  const branchConstraints = allConstraints.filter((constraint) =>
    branches.some((branch) => constraint.branch.join() === branch.join()),
  );

  return async (entity, processors) => {
    if (!processors) processors = ["SCHEMATIC", "RELATIONAL"];

    const issues = [];

    const isSchema = (c) => c.traits.includes("SCHEMATIC");
    const relevantConstraints = branchConstraints
      .filter((constraint) =>
        processors.some((processor) =>
          constraint.traits.includes(processor.toUpperCase()),
        ),
      ) // allways do schema first.
      .sort((a, b) => (isSchema(a) ? -1 : isSchema(b) ? 1 : 0));

    for (const constraint of relevantConstraints) {
      (await constraint.test(entity)).map((f) => issues.push(f));
    }

    return issues;
  };
};

// assertions.existance.tag = async ({ ONTOLOGICAL }) => {
//   const tag = await runtime.entities.tag.findOne({ data: { ONTOLOGICAL } });
//   if (!tag) return await requiredTagIssue({ ONTOLOGICAL }, ontology);
// };
// assertions.existance.unit = async ({ annotation }) => {
//   const issues = assertions.annotation(annotation);
//   if (issues.length > 0)
//     throw new Error("Can only assert valid annotations", annotation);
//   const unit = await runtime.entities.unit.findOne({ annotation });
//   if (!unit) return await requiredUnitIssue({ annotation }, ontology);
// };

// const constraintFilter = (branch) => (constraint) => {const isValidBranch = constraint.branch.join() === branch.join(); const isValidTrait = constraint.traits.includes("SCHEMATIC") || constraint.traits.includes("RELATIONAL"); return isValidBranch && isValidTrait;};
// const requiredTagIssue = async ({ ONTOLOGICAL }, ontology) => {const issue = {message: "Tag missing for ONTOLOGICAL", path: ["tag"], violation: "required", context: { ONTOLOGICAL },}; return await ontology.issues.create(issue);}; const requiredUnitIssue = async ({ annotation }, ontology) => {const issue = {message: "Unit missing for annotation", path: ["unit"], violation: "required", context: { annotation },}; return await ontology.issues.create(issue);};
// const missingAsserterIssue = async ({ unit, annotation }, ontology) => {throw new Error("Missing Asserter: No asserter found"); const context = {}; const message = `Missing Asserter: No asserter found for`; if (annotation) {context.annotation = annotation; message += ` annotation.pos ${annotation.pos}`;} if (unit) {context.unit = unit; message += ` unit.pos ${unit.annotation.pos}`;} const issue = { message, violation: "missing", path: ["asserter"], context }; return await ontology.issues.create(issue);};
