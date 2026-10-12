import { Freight } from "@vivalence/typology";
import { entities } from "./entities/index.js";

export const manifest = {
  type: "topography",
  slug: "latin",
  name: "Latin",
  description:
    "219 words and 50 sentences, English to Latin — classical and ecclesiastical, ten topics, two levels, one lemma symbol per word. Freight: 10 voices, 10 pictures.",
  version: "0.1.0",
  traits: ["DATASET", "FRAUGHT"],
};

export const freight = new Freight("freight");

export const dataset = { entities };
