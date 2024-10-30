export default (schema) => {
  schema.units.sconj = {
    ...schema.unit,
    title: "Subordinating Conjunction",
    description:
      "A subordinating conjunction is a conjunction that introduces a dependent clause, joining it to a main clause. It is also known as a subordinator or subordinate conjunction.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "sconj.annotation.pos", enum: ["sconj"] },
          lemma: { ...schema.annotations.lemma },
        },
        required: ["pos", "lemma"],
      },
    },
  };

  schema.constraints.sconj = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "sconj" } },
  ];

  return schema;
};
