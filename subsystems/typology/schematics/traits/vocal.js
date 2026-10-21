import { v } from "../v.js";
import { Tier, Tune } from "../primitives/hallucination.js";

export const Vocal = v.object({
  language: v.string().optional(),
  tune: v.union([Tier, Tune]).optional(),
  harmonize: v
    .object({
      window: v.integer({ minimum: 1 }).optional(),
      tolerance: v.number({ minimum: 0, maximum: 1 }).optional(),
      tail: v.integer({ minimum: 1 }).optional(),
    })
    .optional(),
  polish: v.boolean().optional(),
});
