export default (schema) => {
  schema.units.adp = {
    ...schema.unit,
    title: "Adposition",
    description:
      "An adposition is a word that combines with a noun or pronoun to form a phrase that typically has an adverbial function.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: {
            ...schema.annotations.pos,
            $id: "adp.annotation.pos",
            enum: ["adp"],
          },
          lemma: { ...schema.annotations.lemma },
        },
        required: ["pos", "lemma"],
      },
    },
  };

  schema.constraints.adp = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adp" } },
  ];

  return schema;
};
