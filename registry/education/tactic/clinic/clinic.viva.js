import dataset from "./dataset/index.js";
import { emitter } from "./emitter/index.js";

export const manifest = {
  type: "tactic",
  slug: "clinic",
  version: "0.0.1",
  name: "Clinic",
  description: "Targeted adaptive practice on specific linguistic dimensions.",
  traits: ["INTENTED", "EMITTER"],
};

export { emitter, dataset };
