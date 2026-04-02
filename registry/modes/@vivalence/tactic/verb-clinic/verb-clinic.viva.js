import dataset from "./dataset/index.js";
import { emitter } from "./emitter/index.js";

export const manifest = {
  type: "tactic",
  slug: "verb-clinic",
  name: "Verb Clinic",
  description: "Targeted practice on specific verb dimensions.",
  traits: ["INTENTED", "EMITTER"],
};

export { emitter, dataset };
