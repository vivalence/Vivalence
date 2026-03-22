import { specimen, BufferView, Type, BufferSchema, Ref } from "@vivalence/typology";

specimen.describe("BufferView", () => {
  specimen.describe("cast", () => {
    specimen.it("fills defaults from TypeBox schema", () => {
      const bv = new BufferView("test.svelte.js", BufferSchema.of({
        data: { recall: Type.String({ default: "LEARNING" }) },
        literals: Type.Array(Ref),
      }));
      const result = bv.cast({ data: { }, literals: [{ id: "hello" }] });
      specimen.expect(result.recall).toBe("LEARNING");
    });

    specimen.it("retains provided values", () => {
      const bv = new BufferView("test.svelte.js", BufferSchema.of({
        data: { recall: Type.String({ default: "LEARNING" }) },
      }));
      const result = bv.cast({ data: { recall: "KNOWN" } });
      specimen.expect(result.recall).toBe("KNOWN");
    });

    specimen.it("does not mutate schema on repeated calls", () => {
      const bv = new BufferView("test.svelte.js", BufferSchema.of({
        data: { recall: Type.String({ default: "LEARNING" }) },
      }));
      bv.cast({ data: { recall: "KNOWN" } });
      const result = bv.cast({ data: {} });
      specimen.expect(result.recall).toBe("LEARNING");
    });

    specimen.it("returns defaults when called without args", () => {
      const bv = new BufferView("test.svelte.js", BufferSchema.of({
        data: { recall: Type.String({ default: "LEARNING" }) },
      }));
      const result = bv.cast();
      specimen.expect(result.recall).toBe("LEARNING");
    });
  });
});

// specimen.describe("BufferView (old)", () => {
//   specimen.describe("cast", () => {
//     specimen.it("merges input over schema defaults", () => {
//       const bv = new BufferView("test.svelte.js", { literal: null, recall: "LEARNING" });
//       const result = bv.cast({ literal: { id: "hello" } });
//       specimen.expect(result.literal).toEqual({ id: "hello" });
//       specimen.expect(result.recall).toBe("LEARNING");
//     });
//     specimen.it("returns schema defaults when called without args", () => {
//       const bv = new BufferView("test.svelte.js", { literal: null, recall: "LEARNING" });
//       const result = bv.cast();
//       specimen.expect(result.literal).toBe(null);
//       specimen.expect(result.recall).toBe("LEARNING");
//     });
//     specimen.it("does not mutate schema on repeated calls", () => {
//       const bv = new BufferView("test.svelte.js", { literal: null, recall: "LEARNING" });
//       bv.cast({ literal: "x", recall: "KNOWN" });
//       const result = bv.cast();
//       specimen.expect(result.literal).toBe(null);
//       specimen.expect(result.recall).toBe("LEARNING");
//     });
//   });
// });
