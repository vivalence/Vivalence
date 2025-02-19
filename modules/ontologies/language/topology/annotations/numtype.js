export const rule = {
  slug: "numtype",
  type: "string",
  title: "Numeral Type",
  description:
    "The type of numeral. Possible values: 'card' (Cardinal: A numeral expressing a quantity), 'ord' (Ordinal: A numeral expressing position or order), 'mult' (Multiplicative: A numeral expressing how many times), 'frac' (Fraction: A numeral expressing a part of a whole).",
  enum: ["card", "ord", "mult", "frac"],
};
// export const meta = {slug: "numtype", enums: {card: { enum: "card", title: "Cardinal", description: "" }, ord: { enum: "ord", title: "Ordinal", description: "" }, mult: { enum: "mult", title: "Multiplicative", description: "" }, frac: { enum: "frac", title: "Fraction", description: "" },},};

export const node = {
  slug: "numtype",
  name: "numeral type",
  description: "The type of numeral.",
  traits: ["ANCESTOR", "CATEGORICAL"],
  data: {
    ANCESTOR: [
      {
        slug: "card",
        name: "Cardinal",
        description: "A numeral expressing a quantity",
      },
      {
        slug: "ord",
        name: "Ordinal",
        description: "A numeral expressing position or order",
      },
      {
        slug: "mult",
        name: "Multiplicative",
        description: "A numeral expressing how many times",
      },
      {
        slug: "frac",
        name: "Fraction",
        description: "A numeral expressing a part of a whole",
      },
    ],
  },
};
