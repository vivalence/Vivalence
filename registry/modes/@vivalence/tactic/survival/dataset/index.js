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
            where: { symbols: ["word", "proficiency.survival"] },
            limit: 8,
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
            lemmas: [
              "word.lemma.falar",
              "word.lemma.precisar",
              "word.lemma.entender",
              "word.lemma.comer",
              "word.lemma.abrir",
              "word.lemma.partir",
              "word.lemma.ser",
              "word.lemma.estar",
              "word.lemma.ir",
              "word.lemma.ter",
              "word.lemma.poder",
              "word.lemma.querer",
              "word.lemma.saber",
              "word.lemma.fazer",
            ],
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
            where: { symbols: ["sentence", "proficiency.survival"] },
            limit: 3,
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
      type: "APPLICATIVE",
      traits: ["FEEDING"],
      trait: {
        FEEDING: {
          mount: "/emit/cooldown",
          queue: 1,
          mask: {
            where: { symbols: ["proficiency.survival"] },
            limit: 8,
          },
        },
      },
    },
  ],
};
