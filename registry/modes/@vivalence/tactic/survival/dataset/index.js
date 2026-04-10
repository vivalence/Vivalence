export default {
  intent: [
    {
      slug: "survival-warmup",
      name: "Warmup",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/warmup",
          queue: 2,
          mask: {
            where: { symbols: ["word", "proficiency.survival"] },
            limit: 8,
          },
        },
      },
    },
    {
      slug: "survival-buildup",
      name: "Build Up",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/buildup",
          queue: 3,
          mask: {
            where: { ontology: "conjugation" },
            limit: 1,
          },
        },
      },
    },
    {
      slug: "survival-exercise",
      name: "Exercise",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/exercise",
          queue: 3,
          mask: {
            where: { symbols: ["sentence", "proficiency.survival"] },
            limit: 3,
          },
        },
      },
    },
    {
      slug: "survival-drill",
      name: "Drill",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/drill",
          queue: 2,
          mask: {
            where: {
              symbols: ["word.part-of-speech.verb", "word.tense.present", "proficiency.survival"],
            },
            limit: 6,
            title: "Verb drill",
          },
        },
      },
    },
    {
      slug: "survival-cooldown",
      name: "Cool Down",
      traits: ["QUEUEING"],
      trait: {
        QUEUEING: {
          mount: "/emit/cooldown",
          queue: 2,
          mask: {
            where: { symbols: ["word", "proficiency.survival"] },
            limit: 8,
          },
        },
      },
    },
  ],
};
