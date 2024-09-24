export default (schema) => {
  schema.units.cconj = {
    ...schema.unit,
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "cconj.annotation.pos", enum: ["cconj"] },
          lemma: { ...schema.annotations.lemma },
        },
        required: ["pos", "lemma"],
      },
    },
  };

  schema.constraints.cconj = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "cconj" } },
  ];

  return schema;
};
