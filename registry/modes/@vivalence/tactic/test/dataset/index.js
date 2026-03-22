export default {
  intent: [
    {
      slug: "test",
      name: "Test",
      type: "APPLICATIVE",
      traits: ["FURNISHED", "FEEDING"],
      trait: {
        FURNISHED: { recall: "LEARNING" },
        FEEDING: {
          mount: "/emit/flashcards",
          queue: 3,
          mask: {
            seek: { symbols: ["word", "proficiency.survival"] },
            batch: 3,
          },
        },
      },
    },
  ],
};

// export default {
//   intent: [
//     {
//       slug: "test",
//       name: "Test",
//       type: "APPLICATIVE",
//       traits: ["FURNISHED", "FEEDING"],
//       trait: {
//         FURNISHED: { recall: "LEARNING" },
//         FEEDING: {
//           mount: "/emit/flashcards",
//           queue: 3,
//           seek: { symbols: ["word", "proficiency.survival"] },
//         },
//       },
//     },
//   ],
// };
