import { specimen, traits } from "@vivalence/typology";

specimen.describe("traits.patch — the change to send for one trait write: the claimed names, the whole trait, the touched one deep-merged", () => {
  specimen.it("claims the new name once, sends every held trait with the touched one merged over its held fields; the entity is not mutated", () => {
    const thread = { traits: ["LABELED", "HARNESSED"], trait: { LABELED: { name: "flamingo" }, HARNESSED: { tier: "slow", effort: "low" } } };
    specimen.expect(traits.patch(thread, { HARNESSED: { tier: "fast" } })).toEqual({ traits: ["LABELED", "HARNESSED"], trait: { LABELED: { name: "flamingo" }, HARNESSED: { tier: "fast", effort: "low" } } });
    specimen.expect(traits.patch(thread, { DOCKED: { view: "closed" } })).toEqual({ traits: ["LABELED", "HARNESSED", "DOCKED"], trait: { LABELED: { name: "flamingo" }, HARNESSED: { tier: "slow", effort: "low" }, DOCKED: { view: "closed" } } });
    specimen.expect(thread.trait.HARNESSED).toEqual({ tier: "slow", effort: "low" });
  });
});
