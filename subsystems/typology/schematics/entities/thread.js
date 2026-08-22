import { v } from "../v.js";
import { Tier, Tune } from "../primitives/hallucination.js";

// thread.trait.INTELLIGENT — the thread's intelligence dial. Claim-gated (traits includes
// "INTELLIGENT"), validated at the harness boundary, projected field-by-field: tune →
// policy, effort → settings. Absent fields mean "the mode decides".
export const INTELLIGENT = v.object({
  tune: v.union([Tier, Tune]).optional(),
  effort: v.enum(["none", "low", "medium", "high"]).optional(),
  rounds: v.integer({ minimum: 1, maximum: 50 }).optional(),
  thinking: v.boolean().optional(),
});

export const VOCAL = v.object({
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

export const ThreadDescriptor = {
  $id: "Thread",
  own: {
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
    cursor: v.integer().default(0).optional(),
    counter: v.integer().default(0).optional(),
  },
  relations: {
    user: () => v.rel(v.user()).optional(),
    mode: () => v.rel(v.mode()).optional(),
    intent: () => v.rel(v.intent()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
  },
  narrowable: ["trait"],
};
