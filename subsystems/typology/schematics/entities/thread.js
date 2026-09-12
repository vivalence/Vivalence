import { v } from "../v.js";
import { Tier, Tune } from "../primitives/hallucination.js";

// thread.trait.INTELLIGENT — the thread's intelligence dial. Read through
// v.thread.trait(row, "INTELLIGENT"): claim-gated (traits includes the name), validated,
// cast; projected field-by-field at the harness: tune → policy, effort → settings.
// Absent fields mean "the mode decides".
const INTELLIGENT = v.object({
  tune: v.union([Tier, Tune]).optional(),
  effort: v.enum(["none", "low", "medium", "high"]).optional(),
  rounds: v.integer({ minimum: 1, maximum: 50 }).optional(),
  thinking: v.boolean().optional(),
});

const VOCAL = v.object({
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
    parent: () => v.rel(v.thread()).optional(),
    children: () => v.array(v.thread()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
  },
  traits: { INTELLIGENT, VOCAL },
  narrowable: ["trait"],
};
