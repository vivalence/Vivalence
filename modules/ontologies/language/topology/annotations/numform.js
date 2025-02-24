export const rule = {
  slug: "numform",
  type: "string",
  title: "Numeral Form",
  description:
    "The form of numerals, indicating whether the number is expressed by digits, Roman numerals, or words.",
  enum: ["digit", "roman", "word"],
};
// export const meta = {slug: "numform", enums: {digit: {enum: "digit", title: "Digit", description: "Number expressed using digits (0-9).",}, roman: {enum: "roman", title: "Roman", description: "Number expressed using Roman numerals.",}, word: {enum: "word", title: "Word", description: "Number expressed in words.",},},};

export const node = {
  slug: "numform",
  name: "numeral form",
  description:
    "The form of numerals, indicating whether the number is expressed by digits, Roman numerals, or words.",
  traits: ["CATEGORICAL", "CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "digit",
        name: "Digit",
        description: "Number expressed using digits (0-9)",
      },
      {
        slug: "roman",
        name: "Roman",
        description: "Number expressed using Roman numerals",
      },
      {
        slug: "word",
        name: "Word",
        description: "Number expressed in words",
      },
    ],
  },
};
