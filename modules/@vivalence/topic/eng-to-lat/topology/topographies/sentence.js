// export const topography = {
//   slug: "sentence",
//   name: "Sentence",
//   description: "Sentences are sentences",
//   traits: ["ANNOTATED", "CONSTRAINED"],
//   data: {
//     ANNOTATED: [
//       { branch: ["pos", "sentence"], required: true },
//       { branch: ["text", "*"], required: true },
//     ],
//     // CONSTRAINED: [],
//   },
// };

export default {
  slug: "sentence",
  name: "Sentence",
  description: "Sentences are sentences",
  annotations: [
    { branch: ["pos", "sentence"], required: true },
    { branch: ["text", "*"], required: true },
  ],
};
