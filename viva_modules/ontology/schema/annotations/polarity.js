export const polarity = {
  $id: "unit.annotation.polarity",
  type: "string",
  title: "Polarity",
  description: "The polarity of an adverb. Possible values: 'neg' (Negative: Indicates negation).",
  enum: ["neg"],
};
export const meta = {
  enums: {
    neg: { enum: "neg", title: "Negative", description: "Indicates negation." },
  },
};
