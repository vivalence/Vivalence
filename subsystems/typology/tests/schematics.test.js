import { specimen, v } from "@vivalence/typology";
const { DataEntitySchema } = v.entities;

specimen.describe("schematics", () => {
  specimen.it("a data entity stays open", () => {
    specimen.expect(DataEntitySchema.check({})).toBe(true);
    specimen.expect(DataEntitySchema.check({
      id: "abc-123",
      createdAt: "2026-03-25T00:00:00Z",
      updatedAt: "2026-03-25T00:00:00Z",
    })).toBe(true);
    specimen.expect(DataEntitySchema.check({ slug: "test" })).toBe(true);
  });

  specimen.it("a buffer schema narrows and fills", () => {
    specimen.expect(v.buffer().check({ mode: "mode-id", data: {} })).toBe(true);
    specimen.expect(v.buffer().check({
      id: "buf-1",
      mode: "mode-id",
      thread: "thread-1",
      index: 3,
      data: { recall: "LEARNING" },
      literals: [{ slug: "hello" }, { slug: "world" }],
      symbols: [],
    })).toBe(true);

    const narrowed = v.buffer({ data: { recall: v.string().default("LEARNING") } });
    specimen.expect(narrowed.check({ mode: "m", data: { recall: "KNOWN" } })).toBe(true);
    specimen.expect(narrowed.cast({ mode: "m", data: {} }).data.recall).toBe("LEARNING");
    specimen.expect(narrowed.cast({ mode: "m", data: { recall: "KNOWN" } }).data.recall).toBe("KNOWN");
    specimen.expect(v.buffer().cast({ mode: "m", data: {} }).index).toBe(0);
  });
});
