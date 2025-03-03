// export const rule = {};

// export const meta = {slug: "aspect", enums: {imp: {enum: "imp", title: "Imperfective", description: "An action or state that is ongoing or repeated",}, perf: {enum: "perf", title: "Perfective", description: "An action or state that is completed",}, prog: {enum: "prog", title: "Progressive", description: "An action or state that is in progress",}, hab: {enum: "hab", title: "Habitual", description: "An action that takes place habitually",}, iter: {enum: "iter", title: "Iterative", description: "An action that is repeated",}, prosp: {enum: "prosp", title: "Prospective", description: "An action that is expected to take place",},},};

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
