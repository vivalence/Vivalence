import { specimen, v } from "@vivalence/typology";

const Yield = v.prototypes.Yield();

specimen.describe("Yield schema", () => {
  specimen.it("a yield declares its condition", () => {
    specimen.expect(Yield.check({ condition: "NOMINAL", entities: { buffer: [{ id: "a", data: {} }] } })).toBe(true);
    specimen.expect(Yield.check({ condition: "EXHAUSTED", entities: { buffer: [] } })).toBe(true);
    specimen.expect(Yield.check({ condition: "ERROR", entities: { buffer: [] }, error: "boom", at: 3 })).toBe(true);

    specimen.expect(Yield.check({ condition: "WAT", entities: { buffer: [] } })).toBe(false);
    specimen.expect(Yield.check({ condition: "NOMINAL", entities: { buffer: 5 } })).toBe(false);
    specimen.expect(Yield.check({ entities: { buffer: [] } })).toBe(false);
    specimen.expect(Yield.check({ foo: 1 })).toBe(false);
  });
});
