export default {
  intent: [
    {
      slug: "clinic-regular-conjugations",
      name: "Regular Conjugations",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/regular-conjugations",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-irregular-conjugations",
      name: "Irregular Conjugations",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/irregular-conjugations",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-questions",
      name: "Question Words",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/questions",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-connectors",
      name: "Connectors",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/connectors",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-negation",
      name: "Negation",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/negation",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-pronouns",
      name: "Pronouns",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/pronouns",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-determiners",
      name: "Determiners",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/determiners",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-adverbs",
      name: "Adverbs",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/adverbs",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-numbers",
      name: "Numbers",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/numbers",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-degrees",
      name: "Adjective Degrees",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/degrees",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-prepositions",
      name: "Prepositions",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/prepositions",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
    {
      slug: "clinic-ser-estar",
      name: "Ser vs Estar",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/ser-estar",
          queue: 2,
          mask: { where: { symbols: ["proficiency.survival"] } },
        },
      },
    },
  ],
};
