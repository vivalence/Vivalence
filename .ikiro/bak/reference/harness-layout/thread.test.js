import { specimen, v } from "@vivalence/typology";

const { Selector, Tier } = v.primitives.hallucination;
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
const Harnessed = v.object({
  ...Selector,
  tier: Tier.default("capable"),
  effort: v.enum(["none", "low", "medium", "high"]).default("low"),
  rounds: v.integer({ minimum: 1, maximum: 100 }).default(12),
  thinking: v.boolean().optional(),
});
const Load = v.enum(["eager", "lazy", "none"]);
const Tooled = v.record(v.string(), Load);
const Primed = v.record(v.string(), Load);
const traits = v.object({
  CONVERSATIONAL: Conversational.default({}).optional(),
  HARNESSED: Harnessed.default({}).optional(),
  TOOLED: Tooled.default({}).optional(),
  PRIMED: Primed.default({}).optional(),
});

specimen.describe("a francesca thread after the model loaded modeB's search and role", () => {
  specimen.it("the thread, whole", () => {
    const thread = {
      id: "01a1b609-5607-741b-98df-9899bdc62e02",
      user: "01a1b1c0-d3b4-724a-9452-32d250140280",
      mode: "01a1b1c0-f0c1-7559-a38c-d59d34854a75",
      phase: "manual",
      traits: ["CONVERSATIONAL", "HARNESSED", "TOOLED", "PRIMED"],
      trait: traits.cast({
        CONVERSATIONAL: { language: ["it", "en"] },
        HARNESSED: { provider: "anthropic" },
        TOOLED: { "/modeB/search": "eager" },
        PRIMED: { "/modeB/role": "eager" },
      }),
      counter: 4,
      parent: null,
    };
    console.log(JSON.stringify(thread, null, 2));
    specimen.expect([...traits.errors(thread.trait)]).toEqual([]);
    specimen.expect([...traits.errors({ TOOLED: { "/modeB/search": "soon" } })].length > 0).toBe(true);
  });
});
