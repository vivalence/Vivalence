import { Freight } from "@vivalence/typology";
import dataset from "./dataset/index.js";

const manifest = {
  type: "topography",
  slug: "english-to-spanish",
  name: "Castilian Spanish Vocabulary",
  version: "0.1.0",
  traits: ["DATASET", "FRAUGHT"],
};

const freight = new Freight("freight/audio");

// const attribution = {
//   audio: "Not owned by the project author — sourced agentically from third-party recordings.",
//   sentences: "Tatoeba, native-speaker recordings (CC-BY 2.0 FR)",
//   words: "Lingua Libre / Wikimedia Commons + Wiktionary pronunciations (CC)",
// };

export { manifest, freight, dataset };
