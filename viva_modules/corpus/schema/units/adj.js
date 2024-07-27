export default (schema) => {
  schema.units.adj = {
    ...schema.unit,
    properties: {
      ...schema.unit.properties,
      annotation: {
        type: "object",
        properties: {
          pos: {
            ...schema.annotations.pos,
            $id: "adj.annotation.pos",
            enum: ["adj"],
          },
          lemma: { ...schema.annotations.lemma },
          gender: { ...schema.annotations.gender },
          number: { ...schema.annotations.number },
          degree: { ...schema.annotations.degree },
        },
        required: ["pos", "lemma", "gender", "number"],
      },
    },
  };

  schema.constraints.adj = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adj" } },
    { required: { branch: "gender", leaf: "masc" } },
    { required: { branch: "gender", leaf: "fem" } },
    { required: { branch: "number", leaf: "sing" } },
    { required: { branch: "number", leaf: "plur" } },
    { unique: { branch: "degree" } },
  ];

  return schema;
};
