export const suffix = {
  $id: "unit.annotation.suffix",
  type: "string",
  title: "Suffix",
  description: "The suffix of the verb",
  enum: ["ar", "ir", "er"],
};

export const meta = {
  slug: "suffix",
  enums: {
    er: { enum: "er", title: "-er", description: "Verbs ending in er" },
    ir: { enum: "ir", title: "-ir", description: "Verbs ending in ir" },
    ar: { enum: "ar", title: "-ar", description: "Verbs ending in ar" },
  },
};
