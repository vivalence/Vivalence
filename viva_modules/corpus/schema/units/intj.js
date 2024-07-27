export default (schema) => {
  schema.units.intj = {
    ...schema.unit,
    properties: {
      ...schema.unit.properties,
      annotation: {
        type: "object",
        properties: {
          pos: {
            ...schema.annotations.pos,
            $id: "intj.annotation.pos",
            enum: ["intj"],
          },
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

// import annotations from "../annotations";
// import unit from "../unit";

// export const schema = {
//   ...unit,
//   properties: {
//     ...unit.properties,
//     annotation: {
//       type: "object",
//       properties: {
//         pos: {
//           ...annotations.pos,
//           $id: "intj.annotation.pos",
//           enum: ["intj"],
//         },
//         lemma: { ...annotations.lemma },
//       },
//       required: ["pos", "lemma"],
//     },
//   },
// };

// export const constraints = [
//   { unique: { branch: "pos" } },
//   { required: { branch: "pos", leaf: "intj" } },
// ];

// export const annotationSpace = [
//   [
//     ["pos", ["intj"]],
//     [
//       "lemma",
//       [
//         "ah",
//         "oh",
//         "eh",
//         "uy",
//         "ay",
//         "sí",
//         "vaya",
//         "caramba",
//         "hola",
//         "adiós",
//         "claro",
//         "genial",
//         "estupendo",
//         "bravo",
//       ],
//     ],
//   ],
// ];

// export const lemmas = [];
// for (const [branch, leaves] of annotationSpace.flat()) {
//   if (branch !== "lemma") continue;
//   lemmas.push(...leaves);
// }
