import { Freight } from "@vivalence/typology";
import dataset from "./dataset/index.js";

const manifest = {
  type: "topology",
  slug: "english-to-brazilian:survival",
  name: "Brazilian Portuguese Vocabulary",
  version: "0.2.0",
  traits: ["DATASET", "FRAUGHT"],
};

const freight = new Freight("freight/audio");

export { manifest, freight, dataset };
