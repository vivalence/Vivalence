export const node = {
  slug: "case",
  name: "case",
  description:
    "Grammatical case marking for nouns, pronouns, adjectives, and determiners.",
  traits: ["CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "nom",
        name: "Nominative",
        description:
          "Subject case, used for sentence subjects and predicate nominatives",
      },
      {
        slug: "acc",
        name: "Accusative",
        description: "Direct object case, also used with certain prepositions",
      },
      {
        slug: "gen",
        name: "Genitive",
        description:
          "Possessive case, shows possession and partitive relationships",
      },
      {
        slug: "dat",
        name: "Dative",
        description:
          "Indirect object case, recipient or beneficiary of an action",
      },
      {
        slug: "abl",
        name: "Ablative",
        description:
          "Instrumental/locative case, shows means, manner, place, time",
      },
      {
        slug: "voc",
        name: "Vocative",
        description:
          "Direct address case, used when calling or addressing someone",
      },
    ],
  },
};
