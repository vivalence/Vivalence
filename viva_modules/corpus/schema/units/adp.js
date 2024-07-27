export default (schema) => {
  schema.units.adp = {
    ...schema.unit,
    title: "Adposition",
    description:
      "An adposition is a word that combines with a noun or pronoun to form a phrase that typically has an adverbial function.",
    properties: {
      ...schema.unit.properties,
      annotation: {
        type: "object",
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
// export const schema = {
//   ...unit,
//   title: "Adposition",
//   description:
//     "An adposition is a word that combines with a noun or pronoun to form a phrase that typically has an adverbial function.",
//   properties: {
//     ...unit.properties,
//     annotation: {
//       type: "object",
//       properties: {
//         pos: {
//           ...annotations.pos,
//           $id: "adp.annotation.pos",
//           enum: ["adp"],
//         },
//         lemma: { ...annotations.lemma },
//       },
//       required: ["pos", "lemma"],
//     },
//   },
// };

// export const constraints = [
//   { unique: { branch: "pos" } },
//   { required: { branch: "pos", leaf: "adp" } },
// ];

// export const units = [
//   [
//     ["pos", ["adp"]],
//     [
//       "lemma",
//       [
//         "a",
//         "ante",
//         "bajo",
//         "cabe",
//         "con",
//         "contra",
//         "de",
//         "desde",
//         "durante",
//         "en",
//         "entre",
//         "hacia",
//         "hasta",
//         "mediante",
//         "para",
//         "por",
//         "según",
//         "sin",
//         "so",
//         "sobre",
//         "tras",
//         "versus",
//         "vía",
//         // "a pesar de", "al lado de", "antes de", "cerca de", "debajo de", "delante de", "dentro de", "después de", "detrás de", "encima de", "enfrente de", "fuera de", "junto a", "lejos de"
//       ],
//     ],
//   ],
// ];

// export const lemmas = [];
// for (const [branch, leaves] of units.flat()) {
//   if (branch !== "lemma") continue;
//   lemmas.push(...leaves);
// }
