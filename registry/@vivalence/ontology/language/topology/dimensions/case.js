export const node = {
  slug: "case",
  name: "case",
  description:
    "Grammatical case marking for nouns, pronouns, adjectives, and determiners.",
  traits: ["CATEGORICAL", "LEARNABLE"],
  data: {
    LEARNABLE: { driver: "BOOLEAN", type: "INDIVIDUAL" },
    CATEGORICAL: [
      {
        slug: "nom",
        name: "Nominative",
        description:
          "Subject case, used for sentence subjects and predicate nominatives",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "acc",
        name: "Accusative",
        description: "Direct object case, also used with certain prepositions",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "gen",
        name: "Genitive",
        description:
          "Possessive case, shows possession and partitive relationships",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "dat",
        name: "Dative",
        description:
          "Indirect object case, recipient or beneficiary of an action",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "abl",
        name: "Ablative",
        description:
          "Instrumental/locative case, shows means, manner, place, time",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "voc",
        name: "Vocative",
        description:
          "Direct address case, used when calling or addressing someone",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
    ],
  },
};
