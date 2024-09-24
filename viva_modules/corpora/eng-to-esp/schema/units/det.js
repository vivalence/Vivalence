export default (schema) => {
  schema.units.det = {
    ...schema.unit,
    title: "Determiner",
    description:
      "Determiners express the reference of a noun phrase in context, modifying nouns to indicate definiteness, specificity, and quantity. In Spanish, they agree in gender and number with the noun they modify. Categories include articles, demonstratives, possessives, and quantifiers.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "det.annotation.pos", enum: ["det"] },
          lemma: { ...schema.annotations.lemma },
          prontype: { ...schema.annotations.prontype },
          definite: { ...schema.annotations.definite },
          poss: { ...schema.annotations.poss },
          person: { ...schema.annotations.person },
          number: { ...schema.annotations.number },
          gender: { ...schema.annotations.gender },
        },
        required: ["pos", "lemma", "prontype"],
        allOf: [
          {
            if: { properties: { prontype: { const: "art" } }, required: ["prontype"] },
            then: { required: ["definite"] },
          },
          {
            if: { properties: { prontype: { const: "prs" } }, required: ["prontype"] },
            then: { required: ["poss", "person"] },
          },
        ],
      },
    },
  };

  schema.constraints.det = [
    { unique: { branch: "pos" } },
    { unique: { branch: "prontype" } },
    { required: { branch: "pos", leaf: "det" } },
    { required: { branch: "prontype" } },
    {
      condition: {
        if: { required: { branch: "prontype", leaf: "art" } },
        then: [{ required: { branch: "definite" } }],
      },
    },
    {
      condition: {
        if: { required: { branch: "prontype", leaf: "prs" } },
        then: [{ required: { branch: "poss" } }, { required: { branch: "person" } }],
      },
    },
  ];

  return schema;
};
