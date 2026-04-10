export default {
  intent: [
    {
      slug: "clinic-regular-conjugations",
      name: "Regular Conjugations",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/regular-conjugations",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-irregular-conjugations",
      name: "Irregular Conjugations",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/irregular-conjugations",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-questions",
      name: "Question Words",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/questions",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-connectors",
      name: "Connectors",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/connectors",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-negation",
      name: "Negation",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/negation",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-pronouns",
      name: "Pronouns",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/pronouns",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-determiners",
      name: "Determiners",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/determiners",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-adverbs",
      name: "Adverbs",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/adverbs",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-numbers",
      name: "Numbers",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/numbers",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-degrees",
      name: "Adjective Degrees",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/degrees",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-prepositions",
      name: "Prepositions",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/prepositions",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-ser-estar",
      name: "Ser vs Estar",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/ser-estar",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
  ],
};
