import { Freight } from "@vivalence/typology";
import dataset from "./dataset/index.js";

const manifest = {
  type: "corpus",
  slug: "english-to-brazilian",
  name: "Brazilian Portuguese Vocabulary",
  version: "0.3.0",
  traits: ["DATASET", "FRAUGHT"],
};

const freight = new Freight("freight/audio");

export { manifest, freight, dataset };
