export const numform = {
  $id: "unit.annotation.numform",
  type: "string",
  title: "Numeral Form",
  description: "The form of numerals, indicating whether the number is expressed by digits, Roman numerals, or words.",
  enum: ["digit", "roman", "word"],
};
export const meta = {
  enums: {
    digit: {
      enum: "digit",
      title: "Digit",
      description: "Number expressed using digits (0-9).",
    },
    roman: {
      enum: "roman",
      title: "Roman",
      description: "Number expressed using Roman numerals.",
    },
    word: {
      enum: "word",
      title: "Word",
      description: "Number expressed in words.",
    },
  },
};
