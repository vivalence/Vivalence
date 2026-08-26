import { Dataset, Datasink, Freight, writer } from "@vivalence/typology";

export const manifest = {
  type: "topography",
  slug: "english-to-italian",
  name: "Italian Vocabulary",
  version: "0.2.0",
  traits: ["DATASET", "FRAUGHT", "DATASINK"],
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

export const datasink = new Datasink({
  literal: [
    ["sentence", "dataset/literals/sentences.js"],
    ["word", writer.split("word.part-of-speech.%", "dataset/literals/words/%.js")],
  ],
});

export { statics } from "./statics/language.js";
