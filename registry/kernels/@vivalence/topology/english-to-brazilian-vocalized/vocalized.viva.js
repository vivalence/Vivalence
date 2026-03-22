import { Freight } from "@vivalence/typology";
import dataset from "./dataset/index.js";

const manifest = {
  type: "topology",
  slug: "english-to-brazilian:vocalized",
  name: "Brazilian Portuguese Vocalized Sentences",
  version: "0.1.0",
  traits: ["DATASET", "FRAUGHT"],
};

const freight = new Freight("/freight");

export { manifest, freight, dataset };
