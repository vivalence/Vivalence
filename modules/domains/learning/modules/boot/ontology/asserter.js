export default function asserterFactory(runtime) {
  return (ontology) => {
    const assertions = {
      unit: null,
      tag: null,
      annotation: null,
      //
      existance: {},
      units: {},
      annotations: {},
    };
    // Gotta fuck with this goofy ass syntax till i migrate to MikroRepositories
    const dimensionConstraints = ontology.dimensions //
      .filter((a) => a.traits.includes("TOPOGRAPHICAL"));
    const tagConstraints = ontology.constraints //
      .filter(constraintFilter(["tag"]));

    for (const dimension of dimensionConstraints) {
      for (const { slug } of dimension.data["CATEGORICAL"]) {
        const topographical = ontology.constraints //
          .filter(constraintFilter(["annotation", slug]));
        // console.log(slug, topographical);
        assertions.annotations[slug] = constraintAsserter(topographical);

        const unitConstraints = ontology.constraints //
          .filter(constraintFilter(["unit", slug]));

        assertions.units[slug] = constraintAsserter(unitConstraints);
      }
    }

    assertions.annotation = (annotation) => {
      if (!assertions.annotations[annotation.pos])
        return [missingAsserterIssue({ annotation }, ontology)];
      return assertions.annotations[annotation.pos](annotation, ["SCHEMATIC"]);
    };

    assertions.unit = (unit, processors) => {
      if (!assertions.units[unit.annotation.pos])
        return [missingAsserterIssue({ unit }, ontology)];
      return assertions.units[unit.annotation.pos](unit, processors);
    };

    assertions.tag = constraintAsserter(tagConstraints);

    assertions.existance.tag = async ({ ONTOLOGICAL }) => {
      const tag = await runtime.entities.tag.findOne({ data: { ONTOLOGICAL } });
      if (!tag) return await requiredTagIssue({ ONTOLOGICAL }, ontology);
    };
    assertions.existance.unit = async ({ annotation }) => {
      const issues = assertions.annotation(annotation);
      if (issues.length > 0)
        throw new Error("Can only assert valid annotations", annotation);
      const unit = await runtime.entities.unit.findOne({ annotation });
      if (!unit) return await requiredUnitIssue({ annotation }, ontology);
    };

    return assertions;
  };
}

const constraintAsserter = (constraints) => async (entity, processors) => {
  if (!processors) processors = ["SCHEMATIC", "RELATIONAL"];
  const issues = [];

  const relevantConstraints = constraints.filter((constraint) =>
    processors.some((processor) =>
      constraint.traits.includes(processor.toUpperCase()),
    ),
  );

  for (const constraint of relevantConstraints) {
    const fails = await constraint.assert(entity);
    fails.map((f) => issues.push(f));
  }

  return issues;
};

const constraintFilter = (branch) => (constraint) => {
  const isValidBranch = constraint.branch.join() === branch.join();
  const isValidTrait =
    constraint.traits.includes("SCHEMATIC") ||
    constraint.traits.includes("RELATIONAL");

  return isValidBranch && isValidTrait;
};

const requiredTagIssue = async ({ ONTOLOGICAL }, ontology) => {
  const issue = {
    message: "Tag missing for ONTOLOGICAL",
    path: ["tag"],
    violation: "required",
    context: { ONTOLOGICAL },
  };
  return await ontology.issues.create(issue);
};

const requiredUnitIssue = async ({ annotation }, ontology) => {
  const issue = {
    message: "Unit missing for annotation",
    path: ["unit"],
    violation: "required",
    context: { annotation },
  };

  return await ontology.issues.create(issue);
};

const missingAsserterIssue = async ({ unit, annotation }, ontology) => {
  const context = {};
  const message = `Missing Asserter: No asserter found for`;
  if (annotation) {
    context.annotation = annotation;
    message += ` annotation.pos ${annotation.pos}`;
  }
  if (unit) {
    context.unit = unit;
    message += ` unit.pos ${unit.annotation.pos}`;
  }
  const issue = { message, violation: "missing", path: ["asserter"], context };
  return await ontology.issues.create(issue);
};
