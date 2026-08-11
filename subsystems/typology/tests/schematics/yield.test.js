import { specimen, v } from "@vivalence/typology";

const Yield = v.prototypes.Yield();

specimen.describe("Yield schema", () => {
  specimen.it("a yield declares its condition", () => {
    specimen.expect(Yield.check({ condition: "NOMINAL", output: { buffer: [{ id: "a", data: {} }] } })).toBe(true);
    specimen.expect(Yield.check({ condition: "EXHAUSTED", output: { buffer: [] } })).toBe(true);
    specimen.expect(Yield.check({ condition: "ERROR", output: { buffer: [] }, error: "boom", at: 3 })).toBe(true);

    specimen.expect(Yield.check({ condition: "WAT", output: { buffer: [] } })).toBe(false);
    specimen.expect(Yield.check({ condition: "NOMINAL", output: { buffer: 5 } })).toBe(false);
    specimen.expect(Yield.check({ output: { buffer: [] } })).toBe(false);
    specimen.expect(Yield.check({ foo: 1 })).toBe(false);
  });
});
