import { tiers, traits, v } from "@vivalence/typology";

const { Selector, Tier } = v.primitives.hallucination;
const Harnessed = v.object({
  ...Selector,
  tier: Tier.default("capable"),
  effort: v.enum(["none", "low", "medium", "high"]).default("low"),
  rounds: v.integer({ minimum: 1, maximum: 100 }).default(12),
  thinking: v.boolean().optional(),
});
const thread = {
  id: "01a1b609-5607-741b-98df-9899bdc62e02",
  user: "01a1b1c0-d3b4-724a-9452-32d250140280",
  mode: "01a1b1c0-f0c1-7559-a38c-d59d34854a75",
  phase: "manual",
  traits: [],
  trait: { HARNESSED: Harnessed.cast({}) },
  counter: 0,
  parent: null,
};
const patched = traits.patch(thread, { HARNESSED: { provider: null, id: null, tier: "fast", tune: tiers.fast } });
const after = { ...thread, ...patched, trait: { HARNESSED: Harnessed.cast(patched.trait.HARNESSED) } };
console.log(JSON.stringify(after, null, 2), [...Harnessed.errors(after.trait.HARNESSED)].length);
