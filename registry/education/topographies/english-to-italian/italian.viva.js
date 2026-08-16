import { Dataset, Freight } from "@vivalence/typology";

export const manifest = {
  type: "topography",
  slug: "english-to-italian",
  name: "Italian Vocabulary",
  version: "0.2.0",
  traits: ["DATASET", "FRAUGHT"],
};

export const freight = new Freight("freight/audio");

// const attribution = {
//   audio: "Not owned by the project author — sourced agentically from third-party recordings.",
//   sentences: "Tatoeba, native-speaker recordings by NM1 (CC BY 4.0)",
//   words: "Lingua Libre / Wikimedia Commons + Wiktionary pronunciations (CC)",
// };

export const dataset = new Dataset({
  symbol: "dataset/symbols",
  literal: "dataset/literals",
});

export { statics } from "./statics/language.js";
