export const verbform = {
  $id: "unit.annotation.verbform",
  type: "string",
  title: "Verb Form",
  description:
    "The form of a verb, indicating its function in a sentence. Possible values: 'fin' (Finite: A verb form that is limited by subject and tense), 'inf' (Infinitive: The base form of a verb, usually preceded by 'to'), 'part' (Participle: A form of a verb used as an adjective or to form compound tenses), 'ger' (Gerund: A verb form that functions as a noun), 'sup' (Supine: A form of a verb used in some languages to denote purpose or intention).",
  enum: ["fin", "inf", "part", "ger"],
};
export const meta = {
  slug: "verbform",
  enums: {
    fin: {
      enum: "fin",
      title: "Finite",
      description: "A verb form that is limited by subject and tense.",
    },
    inf: {
      enum: "inf",
      title: "Infinitive",
      description: "The base form of a verb, usually preceded by 'to'.",
    },
    part: {
      enum: "part",
      title: "Participle",
      description: "A form of a verb used as an adjective or to form compound tenses.",
    },
    ger: {
      enum: "ger",
      title: "Gerund",
      description: "A verb form that functions as a noun.",
    },
  },
};
