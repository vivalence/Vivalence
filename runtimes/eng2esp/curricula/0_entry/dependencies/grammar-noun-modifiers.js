const nounmodifiers1 = {
  name: "First Contact: Noun Modifiers",
  slug: "dependency:noun-modifiers:1",
  traits: ["DEPENDENCY"],
  data: {
    DEPENDENCY: {
      preconditions: [],
      conditions: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }].map(
        (subject) => ({
          solver: {
            subject: "TAG[LEARNABLE]",
            condition: "LOGIC",
          },
          condition: { "!=": [{ var: "memory.status" }, null] },
          subject,
        }),
      ),
      tactic: {
        slug: "ontological-branch-introduction",
        relations: {
          units: {},
          tags: {
            root: { slug: "pos:noun" },
            aspects: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }],
          },
          games: {},
        },
        masks: {
          aspect: { memory: { accept: [null] } },
        },
      },
    },
  },
};

const nounmodifiers2 = {
  name: "Practice: Noun Modifiers",
  slug: "dependency:noun-modifiers:2",
  traits: ["DEPENDENCY"],
  data: {
    DEPENDENCY: {
      preconditions: [
        {
          solver: { subject: "TAG[DEPENDENCY]", condition: null },
          subject: { slug: "dependency:noun-modifiers:1" },
          condition: null,
        },
      ],
      conditions: [
        {
          // more than 20 known or graduated nouns.
          solver: { subject: "TAG[COMPLETABLE]", condition: null },
          subject: { slug: "pos:noun" },
          condition: null,
        },
        ...[
          { slug: "gender:masc" },
          { slug: "number:sing" },
          { slug: "definite:def" },
          { slug: "gender:fem" },
          { slug: "number:plur" },
          { slug: "definite:ind" },
        ].map((subject) => ({
          solver: {
            subject: "TAG[LEARNABLE]",
            condition: "LOGIC",
          },
          condition: {
            and: [
              { "!!": { var: "memory.status" } },
              { "!": { in: [{ var: "memory.status" }, ["UNKNOWN", "LEARNING"]] } },
            ],
          },
          // { "!=": [{ var: "memory.status" }, null] },
          subject,
        })),
      ],
      tactic: {
        // slug: "ontological-branch-introduction",
        // relations: {
        //   units: {},
        //   tags: {
        //     root: { slug: "pos:noun" },
        //     aspects: [{ slug: "gender:*" }, { slug: "number:*" }, { slug: "definite:*" }],
        //   },
        //   games: {},
        // },
        // masks: {
        //   aspect: { memory: { accept: [null] } },
        // },
      },
    },
  },
};
