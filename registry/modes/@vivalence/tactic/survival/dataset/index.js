export default {
  intent: [
    {
      slug: "survival-warmup",
      name: "Warmup",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/warmup",
          queue: 1,
          mask: {
            seek: { symbols: ["word", "proficiency.survival"] },
            batch: 8,
          },
        },
      },
    },
    {
      slug: "survival-buildup",
      name: "Build Up",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/buildup",
          queue: 1,
          mask: {
            seek: { symbols: ["word.part-of-speech.verb", "word.tense.present", "proficiency.survival"] },
            batch: 6,
            title: "Present tense",
            subtitle: "presente do indicativo",
          },
        },
      },
    },
    {
      slug: "survival-exercise",
      name: "Exercise",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/exercise",
          queue: 1,
          mask: {
            seek: { symbols: ["sentence", "proficiency.survival"] },
            batch: 3,
          },
        },
      },
    },
    {
      slug: "survival-drill",
      name: "Drill",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/drill",
          queue: 1,
          mask: {
            seek: { symbols: ["word.part-of-speech.verb", "word.tense.present", "proficiency.survival"] },
            batch: 12,
            title: "Verb drill",
          },
        },
      },
    },
    {
      slug: "survival-cooldown",
      name: "Cool Down",
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/cooldown",
          queue: 1,
          mask: {
            seek: { symbols: ["proficiency.survival"] },
            batch: 8,
          },
        },
      },
    },
  ],
};
