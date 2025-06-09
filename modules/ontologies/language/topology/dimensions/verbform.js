// export const rule = {slug: "verbform", type: "string", title: "Verb Form", description: "The form of a verb, indicating its function in a sentence. Possible values: 'fin' (Finite: A verb form that is limited by subject and tense), 'inf' (Infinitive: The base form of a verb, usually preceded by 'to'), 'part' (Participle: A form of a verb used as an adjective or to form compound tenses), 'ger' (Gerund: A verb form that functions as a noun), 'sup' (Supine: A form of a verb used in some languages to denote purpose or intention).", enum: ["fin", "inf", "part", "ger"],};
// export const meta = {slug: "verbform", enums: {fin: {enum: "fin", title: "Finite", description: "A verb form that is limited by subject and tense.",}, inf: {enum: "inf", title: "Infinitive", description: "The base form of a verb, usually preceded by 'to'.",}, part: {enum: "part", title: "Participle", description: "A form of a verb used as an adjective or to form compound tenses.",}, ger: {enum: "ger", title: "Gerund", description: "A verb form that functions as a noun.",},},};

export const node = {
  slug: "verbform",
  name: "verb form",
  description: "The form of a verb, indicating its function in a sentence.",
  traits: ["CATEGORICAL", "LEARNABLE"],
  data: {
    LEARNABLE: { driver: "BOOLEAN", type: "INDIVIDUAL" },
    CATEGORICAL: [
      {
        slug: "fin",
        name: "Finite",
        description: "A verb form that is limited by subject and tense",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "inf",
        name: "Infinitive",
        description: "The base form of a verb, usually preceded by 'to'",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "part",
        name: "Participle",
        description:
          "A form of a verb used as an adjective or to form compound tenses",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "ger",
        name: "Gerund",
        description: "A verb form that functions as a noun",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
    ],
  },
};
