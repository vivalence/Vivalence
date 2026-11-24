import { specimen, v } from "@vivalence/typology";

const Load = v.enum(["eager", "lazy", "none"]);
const Section = v.object({ load: Load, text: v.string().optional() });
const perPath = v.object({ PRIMED: v.record(v.string(), Section) });
const twoMaps = v.object({
  PRIMED: v.object({ load: v.record(v.string(), Load), text: v.record(v.string(), v.string()) }),
});

specimen.describe("the user rewrites modeB's role section by hand", () => {
  specimen.it("one value per path", () => {
    const trait = perPath.cast({
      PRIMED: { "/modeB": { load: "eager" }, "/modeB/role": { load: "eager", text: "You research. Answer in Italian." } },
    });
    console.log(JSON.stringify(trait, null, 2));
    specimen.expect([...perPath.errors(trait)]).toEqual([]);
  });
  specimen.it("two maps", () => {
    const trait = twoMaps.cast({
      PRIMED: { load: { "/modeB": "eager" }, text: { "/modeB/role": "You research. Answer in Italian." } },
    });
    console.log(JSON.stringify(trait, null, 2));
    specimen.expect([...twoMaps.errors(trait)]).toEqual([]);
  });
});
