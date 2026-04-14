export default {
  intent: [
    {
      slug: "survival-warmup",
      name: "Warmup",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: {
          where: { symbols: ["word", "proficiency.survival"] },
          limit: 8,
        },
        AIMED: { mount: "/emit/warmup" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "survival-buildup",
      name: "Build Up",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: {
          where: { ontology: "conjugation" },
          limit: 1,
        },
        AIMED: { mount: "/emit/buildup" },
        QUEUEING: { depth: 3 },
      },
    },
    {
      slug: "survival-exercise",
      name: "Exercise",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: {
          where: { symbols: ["sentence", "proficiency.survival"] },
          limit: 3,
        },
        AIMED: { mount: "/emit/exercise" },
        QUEUEING: { depth: 3 },
      },
    },
    {
      slug: "survival-drill",
      name: "Drill",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: {
          where: {
            symbols: ["word.part-of-speech.verb", "word.tense.present", "proficiency.survival"],
          },
          limit: 6,
          title: "Verb drill",
        },
        AIMED: { mount: "/emit/drill" },
        QUEUEING: { depth: 2 },
      },
    },
    {
      slug: "survival-cooldown",
      name: "Cool Down",
      traits: ["MASKED", "AIMED", "QUEUEING"],
      trait: {
        MASKED: {
          where: { symbols: ["word", "proficiency.survival"] },
          limit: 8,
        },
        AIMED: { mount: "/emit/cooldown" },
        QUEUEING: { depth: 2 },
      },
    },
  ],
};
