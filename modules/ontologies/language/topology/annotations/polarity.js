// export const rule = {slug: "polarity", type: "string", title: "Polarity", description: "The polarity of an adverb. Possible values: 'neg' (Negative: Indicates negation).", enum: ["neg"],};
// export const meta = {slug: "polarity", enums: {neg: { enum: "neg", title: "Negative", description: "Indicates negation." },},};

export const node = {
  slug: "polarity",
  name: "polarity",
  description: "The polarity of an adverb.",
  traits: ["CATEGORICAL", "CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "neg",
        name: "Negative",
        description: "Indicates negation",
      },
    ],
  },
};
