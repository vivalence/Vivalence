import { specimen, BufferView, v } from "@vivalence/typology";

specimen.describe("BufferView", () => {
  specimen.describe("cast", () => {
    specimen.it("fills defaults from TypeBox schema", () => {
      const bv = new BufferView("test.svelte", v.buffer({
        data: { recall: v.string({ default: "LEARNING" }) },
      }));
      const result = bv.cast({ data: { }, literals: [{ id: "hello" }] });
      specimen.expect(result.recall).toBe("LEARNING");
    });

    specimen.it("retains provided values", () => {
      const bv = new BufferView("test.svelte", v.buffer({
        data: { recall: v.string({ default: "LEARNING" }) },
      }));
      const result = bv.cast({ data: { recall: "KNOWN" } });
      specimen.expect(result.recall).toBe("KNOWN");
    });

    specimen.it("does not mutate schema on repeated calls", () => {
      const bv = new BufferView("test.svelte", v.buffer({
        data: { recall: v.string({ default: "LEARNING" }) },
      }));
      bv.cast({ data: { recall: "KNOWN" } });
      const result = bv.cast({ data: {} });
      specimen.expect(result.recall).toBe("LEARNING");
    });

    specimen.it("returns defaults when called without args", () => {
      const bv = new BufferView("test.svelte", v.buffer({
        data: { recall: v.string({ default: "LEARNING" }) },
      }));
      const result = bv.cast();
      specimen.expect(result.recall).toBe("LEARNING");
    });
  });
});
