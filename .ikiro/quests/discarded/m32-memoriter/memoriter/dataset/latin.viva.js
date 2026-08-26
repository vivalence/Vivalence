import { Freight } from "@vivalence/typology";
import { entities } from "./entities/index.js";

export const manifest = {
  type: "topography",
  slug: "latin-core",
  name: "Latin Core",
  description: "219 words, 50 annotated sentences, English to Latin. Demo freight: 10 voices, 10 pictures.",
  version: "0.1.0",
  traits: ["DATASET", "FRAUGHT"],
};

export const freight = new Freight("freight");

export const dataset = { entities };
