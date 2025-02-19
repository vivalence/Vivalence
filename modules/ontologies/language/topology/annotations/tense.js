export const rule = {
  slug: "tense",
  type: "string",
  title: "Tense",
  description:
    "The time of action or state expressed by the verb. Possible values: 'past' (Past: An action or state that occurred in the past), 'pres' (Present: An action or state that is currently occurring), 'fut' (Future: An action or state that will occur in the future), 'imp' (Imperfect: A past action or state that was ongoing or repeated), 'pqp' (Pluperfect: An action or state that was completed before another past action).",
  enum: ["past", "pres", "fut", "imp"], //, "pqp"],
};
// export const meta = {slug: "tense", enums: {past: {enum: "past", title: "Past", description: "An action or state that occurred in the past.",}, pres: {enum: "pres", title: "Present", description: "An action or state that is currently occurring.",}, fut: {enum: "fut", title: "Future", description: "An action or state that will occur in the future.",}, imp: {enum: "imp", title: "Imperfect", description: "A past action or state that was ongoing or repeated.",},},};
// pqp: {enum: "pqp", title: "Pluperfect", description: "An action or state that was completed before another past action."}
// tense.js
export const node = {
  slug: "tense",
  name: "tense",
  description: "The time of action or state expressed by the verb.",
  traits: ["ANCESTOR", "CATEGORICAL"],
  data: {
    ANCESTOR: [
      {
        slug: "past",
        name: "Past",
        description: "An action or state that occurred in the past",
      },
      {
        slug: "pres",
        name: "Present",
        description: "An action or state that is currently occurring",
      },
      {
        slug: "fut",
        name: "Future",
        description: "An action or state that will occur in the future",
      },
      {
        slug: "imp",
        name: "Imperfect",
        description: "A past action or state that was ongoing or repeated",
      },
    ],
  },
};
