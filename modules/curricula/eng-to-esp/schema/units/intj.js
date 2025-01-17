export default (schema) => {
  schema.units.intj = {
    ...schema.unit,
    title: "Interjection",
    description:
      "Interjections are words that express strong emotions or feelings. They are usually followed by an exclamation mark.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "intj.annotation.pos", enum: ["intj"] },
          lemma: { ...schema.annotations.lemma },
        },
        required: ["pos", "lemma"],
      },
    },
  };

  schema.constraints.intj = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "intj" } },
  ];

  return schema;
};
