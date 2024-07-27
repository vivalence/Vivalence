export default (schema) => {
  schema.units.cconj = {
    ...schema.unit,
    properties: {
      ...schema.unit.properties,
      annotation: {
        type: "object",
        properties: {
          pos: {
            ...schema.annotations.pos,
            $id: "cconj.annotation.pos",
            enum: ["cconj"],
          },
          lemma: { ...schema.annotations.lemma },
        },
        required: ["pos", "lemma"],
      },
    },
  };

  schema.constraints.cconj = [
    { unique: { branch: "pos" } },
    { required: { branch: "pos", leaf: "cconj" } },
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
//           $id: "cconj.annotation.pos",
//           enum: ["cconj"],
//         },
//         lemma: { ...annotations.lemma },
//       },
//       required: ["pos", "lemma"],
//     },
//   },
// };

// export const constraints = [
//   { unique: { branch: "pos" } },
//   { required: { branch: "pos", leaf: "cconj" } },
// ];

// export const units = [
//   [
//     ["pos", ["cconj"]],
//     ["lemma", ["y", "o", "pero", "sino", "ni"]],
//   ],
// ];

// export const lemmas = [];
// for (const [branch, leaves] of units.flat()) {
//   if (branch !== "lemma") continue;
//   lemmas.push(...leaves);
// }
