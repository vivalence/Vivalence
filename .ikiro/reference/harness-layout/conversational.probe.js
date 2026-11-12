import { v } from "@vivalence/typology";
const { Selector } = v.primitives.hallucination;
const Conversational = v.object({
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
  polish: v.boolean().optional(),
});
const full = {
  language: ["it", "en"],
  hear: { provider: "deepgram", id: "flux-general-multi" },
  speak: { provider: "elevenlabs", id: "21m00Tcm4TlvDq8ikWAM", tier: "fast" },
  call: { provider: "openai", tune: [0.4, 1.0, 0.8] },
  harmonize: { window: 3, tolerance: 0.2, tail: 1 },
  polish: true,
};
console.log(JSON.stringify(Conversational.cast(full), null, 2), [...Conversational.errors(Conversational.cast(full))]);
console.log(JSON.stringify(Conversational.cast({}), null, 2), [...Conversational.errors(Conversational.cast({}))]);
console.log([...Conversational.errors({ hear: { tier: "nope" } })].length);
