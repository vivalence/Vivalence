import { Dataset } from "@vivalence/typology";

export const manifest = {
  type: "topography",
  slug: "first-words-reading",
  name: "First Words to Reading",
  version: "0.2.0",
  traits: ["DATASET"],
};

export const dataset = new Dataset({ literal: "dataset/literals" });
