const dependencies = [
  {
    name: "First Contact: Noun Modifiers",
    slug: "dependency:noun-modifiers:1",
    traits: ["DEPENDENCY"],
    data: {
      DEPENDENCY: {
        // preconditions: [{ type: "DEPENDENCY_TAG", slug: "dependency:m1" }],
        preconditions: [],
        conditions: [
          { slug: "gender:*" },
          // { slug: "gender:masc" },
          // { slug: "gender:fem" },
          { slug: "number:*" },
          // { slug: "number:sing" },
          // { slug: "number:plur" },
          { slug: "definite:*" },
          // { slug: "definite:def" },
          // { slug: "definite:ind" },
        ].map((tag) => ({
          type: "MEMORY_STATUS",
          condition: "LEARNING",
          subject: { tag },
        })),
        tactic: {
          slug: "ontological-branch-introduction",
          relations: {
            units: {},
            tags: {
              root: { slug: "pos:noun" },
              aspects: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }],
              // noun: { slug: "pos:noun" },
              // gender: [{ slug: "gender:masc" }, { slug: "gender:fem" }],
              // number: [{ slug: "number:sing" }, { slug: "number:plur" }],
              // definite: [{ slug: "definite:def" }, { slug: "definite:ind" }],
            },
            games: {},
          },
          masks: {},
        },
      },
    },
  },
];

export default dependencies;
