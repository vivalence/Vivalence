import { Freight } from "@vivalence/typology";
import dataset from "./dataset/index.js";

const manifest = {
  type: "topography",
  slug: "english-to-italian",
  name: "Italian Vocabulary",
  version: "0.1.0",
  traits: ["DATASET", "FRAUGHT"],
};

const freight = new Freight("freight/audio");

// const attribution = {
//   audio: "Not owned by the project author — sourced agentically from third-party recordings.",
//   sentences: "Tatoeba, native-speaker recordings by NM1 (CC BY 4.0)",
//   words: "Lingua Libre / Wikimedia Commons + Wiktionary pronunciations (CC)",
// };

export { manifest, freight, dataset };
