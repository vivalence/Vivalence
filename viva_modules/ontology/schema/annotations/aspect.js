export const aspect = {
  $id: "unit.annotation.aspect",
  type: "string",
  title: "Aspect",
  description:
    "The aspect of a verb, indicating the flow of time in the action. Possible values: 'imp' (Imperfective: An action or state that is ongoing or repeated), 'perf' (Perfective: An action or state that is completed), 'prog' (Progressive: An action or state that is in progress), 'hab' (Habitual: An action that takes place habitually), 'iter' (Iterative: An action that is repeated), 'prosp' (Prospective: An action that is expected to take place).",
  enum: ["imp", "perf", "prog", "hab", "iter", "prosp"],
};
export const meta = {
  enums: {
    imp: {
      enum: "imp",
      title: "Imperfective",
      description: "An action or state that is ongoing or repeated",
    },
    perf: {
      enum: "perf",
      title: "Perfective",
      description: "An action or state that is completed",
    },
    prog: {
      enum: "prog",
      title: "Progressive",
      description: "An action or state that is in progress",
    },
    hab: {
      enum: "hab",
      title: "Habitual",
      description: "An action that takes place habitually",
    },
    iter: {
      enum: "iter",
      title: "Iterative",
      description: "An action that is repeated",
    },
    prosp: {
      enum: "prosp",
      title: "Prospective",
      description: "An action that is expected to take place",
    },
  },
};
