import { Dataset } from "@vivalence/typology";

export const manifest = {
  type: "topology",
  slug: "conjugation",
  name: "Conjugation paradigms",
  version: "0.2.0",
  traits: ["DATASET"],
};

export const dataset = new Dataset({
  symbol: [
    {
      slug: "conjugation",
      traits: ["ONTOLOGICAL", "LABELED", "TOPOGRAPHICAL"],
      trait: {
        ONTOLOGICAL: {},
        LABELED: { name: "Conjugation", description: "A conjugation paradigm" },
        TOPOGRAPHICAL: {},
      },
    },
  ],
});
