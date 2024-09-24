export default (schema) => {
  schema.units.adj = {
    ...schema.unit,
    title: "Adjective",
    description:
      "An adjective is a word that describes a noun or pronoun. It tells us what the thing being described is like by giving us more information about the object. Adjectives can be used to describe physical appearance, personality, color, size, shape, age, and more.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
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
