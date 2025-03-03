export default function asserterFactory(ontology) {
  const assertions = { topography: {} };
  // Gotta fuck with this goofy ass syntax till i migrate to MikroRepositories
  const annotations = ontology.annotations.filter((a) => a.traits.includes("TOPOGRAPHICAL"));

  // for each topographical annotation
  for (const annotation of annotations) {
    // create asserter per descendant;
    for (const { slug } of annotation.data["CATEGORICAL"]) {
      const constraints = ontology.constraints.filter(
        (c) =>
          c.branch.join() === ["unit", slug].join() &&
          (c.traits.includes("SCHEMATIC") || c.traits.includes("RELATIONAL")),
      );

      assertions.topography[slug] = constraintAsserter(ontology, constraints);
    }
  }

  assertions.unit = (unit, processors) => {
    return assertions.topography[unit.annotation.pos](unit, processors);
  };

  const tagConstraints = ontology.constraints.filter(
    (c) =>
      c.branch.join() === ["tag"].join() &&
      (c.traits.includes("SCHEMATIC") || c.traits.includes("RELATIONAL")),
  );

  assertions.tag = constraintAsserter(ontology, tagConstraints);

  return assertions;
}

const constraintAsserter =
  (ontology, constraints) =>
  async (entity, processors = ["SCHEMATIC", "RELATIONAL"]) => {
    // determin entity type?
    const issues = [];

    const relevantConstraints = constraints.filter((constraint) =>
      processors.some((processor) => constraint.traits.includes(processor.toUpperCase())),
    );

    for (const constraint of relevantConstraints) {
      const fails = await constraint.assert(entity);
      fails.map((f) => issues.push(f));
    }

    return issues;
  };
