import { v } from "../v.js";
import { Tier, Tune } from "../primitives/hallucination.js";

export const Intelligent = v.object({
  tune: v.union([Tier, Tune]).default("capable").desc('The model tier. Example: "fast"'),
  effort: v.enum(["none", "low", "medium", "high"]).default("low").desc('Reasoning effort. Example: "high"'),
  rounds: v.integer({ minimum: 1, maximum: 50 }).default(12).desc("The round budget. Example: 12"),
  thinking: v.boolean().optional(),
});
