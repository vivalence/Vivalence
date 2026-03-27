import dataset from "./dataset/index.js";
import { emitter } from "./emitter/index.js";

export const manifest = {
  type: "tactic",
  slug: "survival",
  name: "Survival",
  description: "Five-phase thread for conquering survival Brazilian Portuguese.",
  traits: ["INTENTED", "EMITTER"],
};

export { emitter, dataset };
