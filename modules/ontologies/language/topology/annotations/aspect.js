export const node = {
  slug: "aspect",
  name: "aspect",
  description: "The aspect of a verb, indicating the flow of time in the action.",
  traits: ["CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "imp",
        name: "Imperfective",
        description: "An action or state that is ongoing or repeated",
      },
      {
        slug: "perf",
        name: "Perfective",
        description: "An action or state that is completed",
      },
      {
        slug: "prog",
        name: "Progressive",
        description: "An action or state that is in progress",
      },
      {
        slug: "hab",
        name: "Habitual",
        description: "An action that takes place habitually",
      },
      {
        slug: "iter",
        name: "Iterative",
        description: "An action that is repeated",
      },
      {
        slug: "prosp",
        name: "Prospective",
        description: "An action that is expected to take place",
      },
    ],
  },
};
