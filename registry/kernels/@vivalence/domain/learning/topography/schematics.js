export const literal = {
  type: "object",
  title: "literal data",
  description: "data property of literals in language learning domain",
  properties: {
    known: { type: "string" },
    learning: { type: "string" },
    index: { type: "number" },
    example: {
      type: "object",
      properties: {
        known: { type: "string" },
        learning: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  required: ["index", "known", "learning", "example"],
  additionalProperties: false,
};
