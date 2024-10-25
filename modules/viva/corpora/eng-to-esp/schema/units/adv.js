export default (schema) => {
  schema.units.adv = {
    ...schema.unit,
    title: "Adverb",
    description:
      "An adverb is a word that modifies a verb, adjective, determiner, clause, preposition, or sentence. Adverbs typically express manner, place, time, frequency, degree, level of certainty, etc., answering questions such as how?, in what way?, when?, where?, and to what extent?.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        ...schema.unit.properties.annotation,
        properties: {
          pos: { ...schema.annotations.pos, $id: "adv.annotation.pos", enum: ["adv"] },
          lemma: { ...schema.annotations.lemma },
          degree: { ...schema.annotations.degree },
          prontype: { ...schema.annotations.prontype },
        },
        required: ["pos", "lemma"],
      },
    },
  };

  schema.constraints.adv = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "adv" } },
    { unique: { branch: "degree" } },
    { unique: { branch: "prontype" } },
  ];

  return schema;
};
