import { specimen, v } from "@vivalence/typology";

const Yield = v.prototypes.Yield();

specimen.describe("Yield schema", () => {
  specimen.it("accepts NOMINAL with keyed entities", () => {
    specimen.expect(Yield.check({ condition: "NOMINAL", entities: { buffer: [{ id: "a", data: {} }] } })).toBe(true);
  });

  specimen.it("accepts EXHAUSTED with empty entities", () => {
    specimen.expect(Yield.check({ condition: "EXHAUSTED", entities: { buffer: [] } })).toBe(true);
  });

  specimen.it("accepts ERROR with error + extra meta", () => {
    specimen.expect(Yield.check({ condition: "ERROR", entities: { buffer: [] }, error: "boom", at: 3 })).toBe(true);
  });

  specimen.it("rejects an unknown condition", () => {
    specimen.expect(Yield.check({ condition: "WAT", entities: { buffer: [] } })).toBe(false);
  });

  specimen.it("rejects non-array buffer entities", () => {
    specimen.expect(Yield.check({ condition: "NOMINAL", entities: { buffer: 5 } })).toBe(false);
  });

  specimen.it("rejects a missing condition", () => {
    specimen.expect(Yield.check({ entities: { buffer: [] } })).toBe(false);
  });

  specimen.it("rejects an arbitrary object", () => {
    specimen.expect(Yield.check({ foo: 1 })).toBe(false);
  });
});
