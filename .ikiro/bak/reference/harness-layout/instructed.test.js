import { specimen, v } from "@vivalence/typology";

const Load = v.enum(["eager", "lazy", "none"]);
const traits = v.object({
  TOOLED: v.record(v.string(), Load),
  PRIMED: v.record(v.string(), Load),
  INSTRUCTED: v.string(),
});

specimen.describe("the user tells this thread how modeB should answer", () => {
  specimen.it("his own markdown, beside the two load maps", () => {
    const trait = traits.cast({
      TOOLED: { "/modeB": "eager" },
      PRIMED: { "/modeB": "eager" },
      INSTRUCTED: "## research\n\nAnswer in Italian. Cite every source.",
    });
    console.log(JSON.stringify(trait, null, 2));
    specimen.expect([...traits.errors(trait)]).toEqual([]);
  });
});
