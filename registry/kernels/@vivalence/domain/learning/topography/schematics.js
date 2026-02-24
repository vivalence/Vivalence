const literal = {
  traits: {
    TRANSLATED: {
      type: "object",
      title: "translation",
      description: "translation from known to learning language",
      properties: {
        known: { type: "string" },
        learning: { type: "string" },
      },
      required: ["known", "learning"],
      additionalProperties: false,
    },
    EXEMPLIFIED: {
      type: "object",
      title: "exemplified",
      description: "usage in a sentence",
      properties: {
        known: { type: "string" },
        learning: { type: "string" },
      },
      required: ["known", "learning"],
      additionalProperties: false,
    },
  },
};
// export const literal = {
//   type: "object",
//   title: "literal data",
//   description: "data property of literals in language learning domain",
//   properties: {
//     known: { type: "string" },
//     learning: { type: "string" },
//     index: { type: "number" },
//     example: {
//       type: "object",
//       properties: {
//         known: { type: "string" },
//         learning: { type: "string" },
//       },
//       additionalProperties: false,
//     },
//   },
//   required: ["index", "known", "learning", "example"],
//   additionalProperties: false,
// };

// export const literal = {
//   type: "object",
//   title: "literal data",
//   description: "data property of literals in language learning domain",
//   properties: {
//     known: { type: "string" },
//     learning: { type: "string" },
//     index: { type: "number" },
//     example: {
//       type: "object",
//       properties: {
//         known: { type: "string" },
//         learning: { type: "string" },
//       },
//       additionalProperties: false,
//     },
//     patches: {
//       type: "array",
//       items: {
//         type: "string",
//         enum: ["EXEMPLIFIED","CONJUGATED"]
//       },
//       uniqueItems: true,
//       description: "Patches that extend and adapt the literal schema"
//     }
//   },
//   required: ["index", "known", "learning", "example"],
//   additionalProperties: false,
//   allOf: [
//     {
//       if: {
//         properties: { patches: { contains: { const: "CONJUGATABLE" } } }
//       },
//       then: {
//         properties: {
//           conjugations: { type: "object" }
//         },
//         required: ["conjugations"]
//       }
//     },
//     {
//       if: {
//         properties: { patches: { contains: { const: "GENDERED" } } }
//       },
//       then: {
//         properties: {
//           gender: { type: "string", enum: ["masculine", "feminine", "neuter"] }
//         },
//         required: ["gender"]
//       }
//     }
//   ]
// };
