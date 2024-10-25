export const degree = {
  $id: "unit.annotation.degree",
  type: "string",
  title: "Degree",
  description:
    "The degree of comparison for adjectives and adverbs. Possible values: 'Abs' (Absolute: An extreme degree of the base form), 'Cmp' (Comparative: A higher or lower degree of the base form), 'Dim' (Diminutive: A lesser degree or smaller version of something), 'Sup' (Superlative: The highest or lowest degree of the base form).",
  enum: ["abs", "cmp", "dim", "sup"],
};
export const meta = {
  slug: "degree",
  enums: {
    abs: {
      enum: "abs",
      title: "Absolute",
      description: "An extreme degree of the base form.",
    },
    cmp: {
      enum: "cmp",
      title: "Comparative",
      description: "A higher or lower degree of the base form.",
    },
    dim: {
      enum: "dim",
      title: "Diminutive",
      description: "A lesser degree or smaller version of something.",
    },
    sup: {
      enum: "sup",
      title: "Superlative",
      description: "The highest or lowest degree of the base form.",
    },
  },
};
