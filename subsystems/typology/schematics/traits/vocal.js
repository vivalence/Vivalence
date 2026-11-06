import { v } from "../v.js";
import { Selector } from "../primitives/hallucination.js";

export const Vocal = v.object({
  language: v.string().optional(),
  ...Selector,
  harmonize: v
    .object({
      window: v.integer({ minimum: 1 }).optional(),
      tolerance: v.number({ minimum: 0, maximum: 1 }).optional(),
      tail: v.integer({ minimum: 1 }).optional(),
    })
    .optional(),
  polish: v.boolean().optional(),
});
