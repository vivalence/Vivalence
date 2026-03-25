import { specimen, BaseEntitySchema, Value, v } from "@vivalence/typology";

specimen.describe("schematics", () => {
  specimen.describe("BaseEntitySchema", () => {
    specimen.it("all fields optional", () => {
      specimen.expect(Value.Check(BaseEntitySchema, {})).toBe(true);
    });

    specimen.it("accepts full shape", () => {
      specimen.expect(Value.Check(BaseEntitySchema, {
        id: "abc-123",
        createdAt: "2026-03-25T00:00:00Z",
        updatedAt: "2026-03-25T00:00:00Z",
      })).toBe(true);
    });

    specimen.it("allows additional properties", () => {
      specimen.expect(Value.Check(BaseEntitySchema, { slug: "test" })).toBe(true);
    });
  });

  specimen.describe("Buffer via v.buffer()", () => {
    specimen.it("validates minimal buffer", () => {
      specimen.expect(v.buffer().check({
        mode: "mode-id",
        data: {},
      })).toBe(true);
    });

    specimen.it("validates full buffer", () => {
      specimen.expect(v.buffer().check({
        id: "buf-1",
        mode: "mode-id",
        session: "sess-1",
        index: 3,
        data: { recall: "LEARNING" },
        literals: [{ slug: "hello" }, { slug: "world" }],
        symbols: [],
      })).toBe(true);
    });

    specimen.it("narrowing narrows data fields", () => {
      const schema = v.buffer({
        data: { recall: v.string().default("LEARNING") },
      });
      specimen.expect(schema.check({ mode: "m", data: { recall: "KNOWN" } })).toBe(true);
    });

    specimen.it("Value.Default fills defaults on narrowed", () => {
      const schema = v.buffer({
        data: { recall: v.string().default("LEARNING") },
      });
      const value = schema.defaults({ mode: "m", data: {} });
      specimen.expect(value.data.recall).toBe("LEARNING");
    });

    specimen.it("Value.Default retains provided values", () => {
      const schema = v.buffer({
        data: { recall: v.string().default("LEARNING") },
      });
      const value = schema.defaults({ mode: "m", data: { recall: "KNOWN" } });
      specimen.expect(value.data.recall).toBe("KNOWN");
    });

    specimen.it("Value.Default fills index default", () => {
      const value = v.buffer().defaults({ mode: "m", data: {} });
      specimen.expect(value.index).toBe(0);
    });
  });
});
