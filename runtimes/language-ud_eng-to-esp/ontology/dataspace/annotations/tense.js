export const tense = {
  $id: "unit.annotation.tense",
  type: "string",
  title: "Tense",
  description:
    "The time of action or state expressed by the verb. Possible values: 'past' (Past: An action or state that occurred in the past), 'pres' (Present: An action or state that is currently occurring), 'fut' (Future: An action or state that will occur in the future), 'imp' (Imperfect: A past action or state that was ongoing or repeated), 'pqp' (Pluperfect: An action or state that was completed before another past action).",
  enum: ["past", "pres", "fut", "imp"], //, "pqp"],
};
export const meta = {
  enums: {
    past: {
      enum: "past",
      title: "Past",
      description: "An action or state that occurred in the past.",
    },
    pres: {
      enum: "pres",
      title: "Present",
      description: "An action or state that is currently occurring.",
    },
    fut: {
      enum: "fut",
      title: "Future",
      description: "An action or state that will occur in the future.",
    },
    imp: {
      enum: "imp",
      title: "Imperfect",
      description: "A past action or state that was ongoing or repeated.",
    },
    // pqp: {enum: "pqp", title: "Pluperfect", description: "An action or state that was completed before another past action."}
  },
};
