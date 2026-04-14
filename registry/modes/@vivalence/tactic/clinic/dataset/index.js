export default {
  intent: [
    {
      slug: "clinic-regular-conjugations",
      name: "Regular Conjugations",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/regular-conjugations" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-irregular-conjugations",
      name: "Irregular Conjugations",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/irregular-conjugations" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-questions",
      name: "Question Words",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/questions" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-connectors",
      name: "Connectors",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/connectors" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-negation",
      name: "Negation",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/negation" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-pronouns",
      name: "Pronouns",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/pronouns" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-determiners",
      name: "Determiners",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/determiners" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-adverbs",
      name: "Adverbs",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/adverbs" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-numbers",
      name: "Numbers",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/numbers" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-degrees",
      name: "Adjective Degrees",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/degrees" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-prepositions",
      name: "Prepositions",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/prepositions" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-ser-estar",
      name: "Ser vs Estar",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { symbols: ["proficiency.survival"] } },
        AIMED: { mount: "/emit/ser-estar" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-audio-words",
      name: "Audio: Words",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { ontology: "word" }, limit: 6 },
        AIMED: { mount: "/emit/audio-words" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "clinic-audio-sentences",
      name: "Audio: Sentences",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: { where: { ontology: "sentence" }, limit: 4 },
        AIMED: { mount: "/emit/audio-sentences" },
        QUEUEING: { depth: 2 },
      },
    },
  ],
};
