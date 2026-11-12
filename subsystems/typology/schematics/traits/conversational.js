import { v } from "../v.js";
import { Selector } from "../primitives/hallucination.js";

export const Conversational = v.object({
  language: v.array(v.string()).default([]),
  hear: v.object({ ...Selector }).default({}),
  speak: v.object({ ...Selector }).default({}),
  call: v.object({ ...Selector }).default({}),
  harmonize: v
    .object({
      window: v.integer({ minimum: 1 }).optional(),
      tolerance: v.number({ minimum: 0, maximum: 1 }).optional(),
      tail: v.integer({ minimum: 1 }).optional(),
    })
    .optional(),
  polish: v
    .object({
      ...Selector,
      engaged: v.boolean().default(true).optional(),
    })
    .default({})
    .desc('The model that repairs a dictation, and whether it runs. Example: { id: "google/gemini-3.5-flash-lite", engaged: false }'),
});
