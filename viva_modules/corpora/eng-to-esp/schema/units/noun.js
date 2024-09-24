export default (schema) => {
  schema.units.noun = {
    ...schema.unit,
    title: "Noun",
    description: "A noun is a word that represents a person, place, or thing.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "noun.annotation.pos", enum: ["noun", "propn"] },
          lemma: { ...schema.annotations.lemma },
          gender: { ...schema.annotations.gender },
          number: { ...schema.annotations.number },
        },
        required: ["pos", "lemma", "gender", "number"],
      },
    },
  };

  schema.constraints.noun = [
    { unique: { branch: "pos" } },
    {
      some: [
        { required: { branch: "pos", leaf: "noun" } },
        { required: { branch: "pos", leaf: "propn" } },
      ],
    },
    { unique: { branch: "gender" } },
    {
      some: [
        { required: { branch: "gender", leaf: "masc" } },
        { required: { branch: "gender", leaf: "fem" } },
      ],
    },
    { required: { branch: "number", leaf: "sing" } },
    { required: { branch: "number", leaf: "plur" } },
  ];

  return schema;
};
