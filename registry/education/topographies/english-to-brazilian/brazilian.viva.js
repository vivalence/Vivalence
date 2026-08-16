import { Dataset, Freight } from "@vivalence/typology";

export const manifest = {
  type: "topography",
  slug: "english-to-brazilian",
  name: "Brazilian Portuguese Vocabulary",
  version: "0.4.0",
  traits: ["DATASET", "FRAUGHT"],
};

export const freight = new Freight("freight/audio");

export const dataset = new Dataset({
  symbol: "dataset/symbols",
  literal: "dataset/literals",
});

export { statics } from "./statics/language.js";
