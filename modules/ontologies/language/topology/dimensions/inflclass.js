export const node = {
  slug: "inflclass",
  name: "inflection class",
  description:
    "Morphological inflection class for nouns, adjectives, and verbs.",
  traits: ["CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "indeura",
        name: "Indo-European A-stem",
        description: "First declension (mostly feminine nouns)",
      },
      {
        slug: "indeuro",
        name: "Indo-European O-stem",
        description: "Second declension (masculine and neuter nouns)",
      },
      {
        slug: "indeuri",
        name: "Indo-European I-stem",
        description: "Third declension i-stem variation",
      },
      {
        slug: "indeurx",
        name: "Indo-European consonant stem",
        description: "Third declension consonant stems",
      },
      {
        slug: "indeure",
        name: "Indo-European E-stem",
        description: "Fifth declension (e-stem nouns)",
      },
      {
        slug: "indeuru",
        name: "Indo-European U-stem",
        description: "Fourth declension (u-stem nouns)",
      },
      {
        slug: "latanom",
        name: "Latin anomalous",
        description: "Irregular Latin inflection patterns",
      },
      {
        slug: "lata",
        name: "Latin A-conjugation",
        description: "First conjugation verbs (-are)",
      },
      {
        slug: "late",
        name: "Latin E-conjugation",
        description: "Second conjugation verbs (-ere)",
      },
      {
        slug: "latx",
        name: "Latin consonant conjugation",
        description: "Third conjugation verbs (consonant stem)",
      },
      {
        slug: "lati",
        name: "Latin I-conjugation",
        description: "Fourth conjugation verbs (-ire)",
      },
      {
        slug: "latpron",
        name: "Latin pronominal",
        description: "Pronominal inflection patterns",
      },
    ],
  },
};
