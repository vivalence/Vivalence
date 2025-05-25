export const node = {
  slug: "advtype",
  name: "adverb type",
  description: "Semantic classification of adverbs by function.",
  traits: ["CATEGORICAL"],
  data: {
    CATEGORICAL: [
      {
        slug: "loc",
        name: "Locative",
        description: "Adverbs of place (where, whence, whither)",
      },
      {
        slug: "tim",
        name: "Temporal",
        description: "Adverbs of time (when, how long, how often)",
      },
    ],
  },
};
