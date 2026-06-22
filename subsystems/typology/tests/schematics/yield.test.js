import { specimen, v } from "@vivalence/typology";

const Yield = v.prototypes.Yield();

specimen.describe("Yield schema", () => {
  specimen.it("accepts NOMINAL with buffers", () => {
    specimen.expect(Yield.check({ condition: "NOMINAL", buffers: [{ id: "a", data: {} }] })).toBe(true);
  });

  specimen.it("accepts EXHAUSTED with empty buffers", () => {
    specimen.expect(Yield.check({ condition: "EXHAUSTED", buffers: [] })).toBe(true);
  });

  specimen.it("accepts ERROR with error + extra meta", () => {
    specimen.expect(Yield.check({ condition: "ERROR", buffers: [], error: "boom", at: 3 })).toBe(true);
  });

  specimen.it("rejects an unknown condition", () => {
    specimen.expect(Yield.check({ condition: "WAT", buffers: [] })).toBe(false);
  });

  specimen.it("rejects non-array buffers", () => {
    specimen.expect(Yield.check({ condition: "NOMINAL", buffers: 5 })).toBe(false);
  });

  specimen.it("rejects a missing condition", () => {
    specimen.expect(Yield.check({ buffers: [] })).toBe(false);
  });

  specimen.it("rejects an arbitrary object", () => {
    specimen.expect(Yield.check({ foo: 1 })).toBe(false);
  });
});
