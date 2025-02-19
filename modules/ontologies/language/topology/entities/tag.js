// really more of a domain thing.
export default {
  type: "object",
  title: "tag",
  description: "",
  properties: {
    slug: {
      type: "string",
      description: "functions as a unique identifier for the tag across runtimes.",
    },
    traits: {
      // enum ONTOLOGICAL STRUCTURAL LEARNABLE COMPLETABLE
      type: "array",
      items: {
        type: "string",
        enum: ["ONTOLOGICAL", "STRUCTURAL", "LEARNABLE", "COMPLETABLE"],
      },
    },
    data: {
      type: "object",
      description: "the schema of a tags's data.",
      // depends on the traits properties: {}, required: [],
    },
  },
  required: ["slug", "data", "traits"],
};

// return schema;
// };
// {
//   type: "object",
//   title: "tag",
//   description: "",
//   properties: {
//     slug: {
//       type: "string",
//       description: "functions as a unique identifier for the tag across runtimes.",
//     },
//     traits: {
//       // enum ONTOLOGICAL STRUCTURAL LEARNABLE COMPLETABLE
//       type: "array",
//       items: {
//         type: "string",
//         enum: ["ONTOLOGICAL", "STRUCTURAL", "LEARNABLE", "COMPLETABLE"],
//       },
//     },
//     data: {
//       type: "object",
//       description: "the schema of a tags's data.",
//       // depends on the traits properties: {}, required: [],
//     },
//   },
//   required: ["slug", "data", "traits"],
// }
