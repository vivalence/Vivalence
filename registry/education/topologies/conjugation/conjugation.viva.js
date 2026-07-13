export const manifest = {
  type: "topology",
  slug: "conjugation",
  name: "Conjugation paradigms",
  version: "0.1.0",
  traits: ["DATASET"],
};

export const dataset = {
  schema: {},
  entities: {
    symbol: [
      {
        slug: "conjugation",
        traits: ["ONTOLOGICAL", "LABELED", "TOPOGRAPHICAL"],
        data: {
          ONTOLOGICAL: {},
          LABELED: { name: "Conjugation", description: "A conjugation paradigm" },
          TOPOGRAPHICAL: {},
        },
      },
    ],
  },
};
