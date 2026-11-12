import { specimen, v } from "@vivalence/typology";

const Yield = v.prototypes.Yield;

specimen.describe("Yield schema", () => {
  specimen.it("a yield declares its condition", () => {
    specimen.expect(Yield.check({ condition: "NOMINAL", product: { buffer: [{ id: "a", data: {} }] } })).toBe(true);
    specimen.expect(Yield.check({ condition: "EXHAUSTED", product: { buffer: [] } })).toBe(true);
    specimen.expect(Yield.check({ condition: "ERROR", product: { buffer: [] }, error: "boom", at: 3 })).toBe(true);

    specimen.expect(Yield.check({ condition: "WAT", product: { buffer: [] } })).toBe(false);
    specimen.expect(Yield.check({ condition: "NOMINAL", product: { buffer: 5 } })).toBe(false);
    specimen.expect(Yield.check({ product: { buffer: [] } })).toBe(false);
    specimen.expect(Yield.check({ foo: 1 })).toBe(false);
  });
});
