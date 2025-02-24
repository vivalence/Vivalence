export default (schema) => {
  schema.units.punct = {
    ...schema.unit,
    title: "Punctuation",
    description: "Punctuation marks",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "punct.annotation.pos", enum: ["punct"] },
          lemma: { ...schema.annotations.lemma },
        },
        required: ["pos", "lemma"],
      },
    },
  };

  schema.constraints.punct = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "punct" } },
  ];

  return schema;
};
