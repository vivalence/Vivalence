export const rule = {
  slug: "suffix",
  type: "string",
  title: "Suffix",
  description: "The suffix of the verb",
  enum: ["ar", "ir", "er"],
};

// export const meta = {slug: "suffix", enums: {er: { enum: "er", title: "-er", description: "Verbs ending in er" }, ir: { enum: "ir", title: "-ir", description: "Verbs ending in ir" }, ar: { enum: "ar", title: "-ar", description: "Verbs ending in ar" },},};
export const node = {
  slug: "suffix",
  name: "suffix",
  description: "The suffix of the verb",
  traits: ["CATEGORICAL", "CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "er",
        name: "-er",
        description: "Verbs ending in er",
      },
      {
        slug: "ir",
        name: "-ir",
        description: "Verbs ending in ir",
      },
      {
        slug: "ar",
        name: "-ar",
        description: "Verbs ending in ar",
      },
    ],
  },
};
