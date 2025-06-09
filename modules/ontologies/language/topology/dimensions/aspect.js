export const node = {
  slug: "aspect",
  name: "aspect",
  description:
    "The aspect of a verb, indicating the flow of time in the action.",
  traits: ["CATEGORICAL", "LEARNABLE"],
  data: {
    LEARNABLE: { driver: "BOOLEAN", type: "INDIVIDUAL" },
    CATEGORICAL: [
      {
        slug: "imp",
        name: "Imperfective",
        description: "An action or state that is ongoing or repeated",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "perf",
        name: "Perfective",
        description: "An action or state that is completed",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "prog",
        name: "Progressive",
        description: "An action or state that is in progress",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "hab",
        name: "Habitual",
        description: "An action that takes place habitually",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "iter",
        name: "Iterative",
        description: "An action that is repeated",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
      {
        slug: "prosp",
        name: "Prospective",
        description: "An action that is expected to take place",
        traits: ["LEARNABLE"],
        data: { LEARNABLE: { driver: "BAYESIAN", type: "RELATIONAL" } },
      },
    ],
  },
};
