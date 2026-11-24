import { specimen, v } from "@vivalence/typology";

const Load = v.enum(["eager", "lazy", "none"]);
const one = v.object({ ARMED: v.record(v.string(), Load) });
const two = v.object({ ARMED: v.record(v.string(), Load), PRIMED: v.record(v.string(), Load) });

specimen.describe("a thread after the model loaded modeB", () => {
  specimen.it("one trait", () => {
    const trait = one.cast({ ARMED: { "/modeB": "eager" } });
    console.log(JSON.stringify(trait, null, 2));
    specimen.expect([...one.errors(trait)]).toEqual([]);
  });
  specimen.it("two traits, then the user drops modeB's primer and keeps its tools", () => {
    const trait = two.cast({ ARMED: { "/modeB": "eager" }, PRIMED: { "/modeB": "none" } });
    console.log(JSON.stringify(trait, null, 2));
    specimen.expect([...two.errors(trait)]).toEqual([]);
  });
});
