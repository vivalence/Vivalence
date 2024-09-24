export default (schema) => {
  schema.units.num = {
    ...schema.unit,
    title: "Number",
    description:
      "Numbers are words that denote a quantity. They can be cardinal, ordinal, multiplicative, or fractional.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "num.annotation.pos", enum: ["num"] },
          lemma: { ...schema.annotations.lemma },
          gender: { ...schema.annotations.gender },
          number: { ...schema.annotations.number },
          numtype: { ...schema.annotations.numtype },
          numform: { ...schema.annotations.numform },
        },
        required: ["pos", "lemma", "numtype"],
      },
    },
  };

  schema.constraints.num = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "num" } },
    { unique: { branch: "gender" } },
    { unique: { branch: "number" } },
    { unique: { branch: "numtype" } },
    { unique: { branch: "numform" } },
  ];
  return schema;
};
