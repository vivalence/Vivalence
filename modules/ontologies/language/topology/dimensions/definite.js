// export const rule = {slug: "definite", type: "string", title: "Definiteness", description: "Indicates whether a noun is definite or indefinite. Possible values: 'def' (Definite: Refers to something specific or known), 'ind' (Indefinite: Refers to something nonspecific or unknown).", enum: ["def", "ind"],};

// nodes topology
// EDITS: guarantee meta export and add topological trait to pos.
// export const meta = {slug: "definite", enums: {def: { enum: "def", title: "Definite", description: "" }, ind: { enum: "ind", title: "Indefinite", description: "" },},};
export const node = {
  slug: "definite",
  name: "definiteness",
  description: "Indicates whether a noun is definite or indefinite.",
  traits: ["CATEGORICAL", "LEARNABLE"],
  data: {
    LEARNABLE: { driver: "BOOLEAN", type: "INDIVIDUAL" },
    CATEGORICAL: [
      {
        slug: "def",
        name: "Definite",
        description: "Refers to something specific or known",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "ind",
        name: "Indefinite",
        description: "Refers to something nonspecific or unknown",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
    ],
  },
};
