import { Dataset } from "@vivalence/typology";

export const manifest = {
  type: "topology",
  slug: "curriculum",
  name: "What a Child Learns",
  version: "0.2.0",
  traits: ["DATASET"],
};

export const dataset = new Dataset({ symbol: "dataset/symbols" });
