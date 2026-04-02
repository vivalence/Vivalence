import dataset from "./dataset/index.js";
import { emitter } from "./emitter/index.js";

export const manifest = {
  type: "tactic",
  slug: "five-fold-session",
  name: "Five-Fold Session",
  description: "Five-phase thread: warmup, buildup, exercise, drill, cooldown.",
  traits: ["INTENTED", "EMITTER"],
};

export { emitter, dataset };
