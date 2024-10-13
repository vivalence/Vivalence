export const definite = {
  $id: "unit.annotation.definite",
  type: "string",
  title: "Definiteness",
  description:
    "Indicates whether a noun is definite or indefinite. Possible values: 'def' (Definite: Refers to something specific or known), 'ind' (Indefinite: Refers to something nonspecific or unknown).",
  enum: ["def", "ind"],
};

export const meta = {
  config: {
    tags: {
      "definite:*": {
        traits: ["LEARNABLE"],
        data: {
          LEARNABLE: {
            type: "BOOLEAN",
          },
        },
      },
      "definite:def": {
        traits: ["LEARNABLE"],
        data: {
          LEARNABLE: {
            flavor: "RELATIONAL",
          },
        },
      },
      "definite:ind": {
        traits: ["LEARNABLE"],
        data: {
          LEARNABLE: {
            flavor: "RELATIONAL",
          },
        },
      },
    },
  },
  enums: {
    def: { enum: "def", title: "Definite", description: "" },
    ind: { enum: "ind", title: "Indefinite", description: "" },
  },
};
