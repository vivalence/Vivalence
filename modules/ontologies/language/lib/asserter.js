const ruleFrom =
  (ontology) =>
  ({ branch, trait }) =>
    Array.from(ontology.rules).find((rule) => {
      return rule.branch.join() === branch.join() && rule.traits.includes(trait);
    });

const annotationFrom =
  (ontology) =>
  ({ branch }) =>
    Array.from(ontology.annotations).find((annotation) => {
      // FUTURE: handle nested annotations / aka branch.
      return [annotation.slug].join() === branch.join();
    });

const topographyAsserter = (ontology, topography) => {
  const unitSchemaRule = ruleFrom(ontology)({ branch: ["unit"], trait: "SCHEMATIC" });
  const schema = unitSchemaRule.data.json;

  topography.annotations.map(({ branch, required }) => {
    const annotation = annotationFrom(ontology)({ branch });
    schema.properties.annotation.properties[annotation.slug] = {
      type: "string", // from categorical
      title: annotation.name,
      description: annotation.description,
      enum: annotation.data.CATEGORICAL.map(({ slug }) => slug),
    };
    if (required) schema.properties.annotation.required.push(annotation.slug);
  });

  return (entity, processors = ["schematic", "relational"]) => {
    // apply zod
  };
};

export default function assertFactory(ontology, assertions) {
  const annotations = Array.from(ontology.annotations).filter((node) =>
    node.traits.includes("TOPOGRAPHICAL"),
  );

  for (const annotation of annotations) {
    for (let { slug } of annotation.data["CATEGORICAL"]) {
      const topography = Array.from(ontology.topographies).find((t) => slug === t.slug);
      assertions.topography[slug] = topographyAsserter(ontology, topography);
    }
  }

  return assertions;
}
