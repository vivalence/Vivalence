export default (schema) => {
  schema.units.sconj = {
    ...schema.unit,
    properties: {
      ...schema.unit.properties,
      annotation: {
        type: "object",
        properties: {
          pos: {
            ...schema.annotations.pos,
            $id: "sconj.annotation.pos",
            enum: ["sconj"],
          },
          lemma: { ...schema.annotations.lemma },
        },
        required: ["pos", "lemma"],
      },
    },
  };

  schema.constraints.sconj = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "sconj" } },
  ];

  return schema;
};
// export const schema = {
//   ...unit,
//   properties: {
//     ...unit.properties,
//     annotation: {
//       type: "object",
//       properties: {
//         pos: {
//           ...annotations.pos,
//           $id: "sconj.annotation.pos",
//           enum: ["sconj"],
//         },
//         lemma: { ...annotations.lemma },
//       },
//       required: ["pos", "lemma"],
//       // additionalProperties: false
//     },
//     // tags: {...ontologyTags}
//   },
// };

// export const constraints = [
//   { unique: { branch: "pos" } },
//   { required: { branch: "pos", leaf: "sconj" } },
// ];

// export const annotationSpace = [
//   [
//     ["pos", ["sconj"]],
//     [
//       "lemma",
//       [
//         "cuando",
//         "pues",
//         "mientras",
//         "aunque",
//         "porque",
//         "si",
//         "que",
//         "como",
//         // cant handle those yet because of the space.
//         // "a fin de que", "a menos que", "a pesar de que", "antes de que", "como si", "con tal de que", "después de que", "donde", "en cuanto", "para que", "puesto que", "sin que", "siempre que", "ya que"
//       ],
//     ],
//   ],
// ];
// export const lemmas = [];
// for (const [branch, leaves] of annotationSpace.flat()) {
//   if (branch !== "lemma") continue;
//   lemmas.push(...leaves);
// }
