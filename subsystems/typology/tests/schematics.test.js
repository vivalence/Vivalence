import { specimen, Ref, BufferSchema, BaseEntitySchema, Type, Value } from "@vivalence/typology";

specimen.describe("schematics", () => {
  specimen.describe("Ref", () => {
    specimen.it("accepts ID string", () => {
      specimen.expect(Value.Check(Ref, "abc-123")).toBe(true);
    });

    specimen.it("accepts object with id", () => {
      specimen.expect(Value.Check(Ref, { id: "abc-123" })).toBe(true);
    });

    specimen.it("accepts object with id and extra properties", () => {
      specimen.expect(Value.Check(Ref, { id: "abc-123", slug: "hello", trait: {} })).toBe(true);
    });

    specimen.it("rejects empty string", () => {
      specimen.expect(Value.Check(Ref, "")).toBe(false);
    });

    specimen.it("rejects object without id", () => {
      specimen.expect(Value.Check(Ref, { slug: "hello" })).toBe(false);
    });

    specimen.it("rejects non-string non-object", () => {
      specimen.expect(Value.Check(Ref, 42)).toBe(false);
    });

    specimen.it("Ref.to narrows to specific schema", () => {
      const Mode = Type.Object({ id: Type.String(), slug: Type.String() }, { $id: "Mode" });
      const ModeRef = Ref.to(Mode);
      specimen.expect(Value.Check(ModeRef, "mode-id")).toBe(true);
      specimen.expect(Value.Check(ModeRef, { id: "mode-id", slug: "flashcard" })).toBe(true);
    });
  });

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

  specimen.describe("Buffer", () => {
    specimen.it("validates minimal buffer", () => {
      specimen.expect(Value.Check(BufferSchema, {
        mode: "mode-id",
        data: {},
      })).toBe(true);
    });

    specimen.it("validates full buffer", () => {
      specimen.expect(Value.Check(BufferSchema, {
        id: "buf-1",
        mode: "mode-id",
        session: "sess-1",
        index: 3,
        data: { recall: "LEARNING" },
        literals: ["lit-1", { id: "lit-2", slug: "hello" }],
        symbols: [],
      })).toBe(true);
    });

    specimen.it("rejects missing mode", () => {
      specimen.expect(Value.Check(BufferSchema, { data: {} })).toBe(false);
    });

    specimen.it("rejects missing data", () => {
      specimen.expect(Value.Check(BufferSchema, { mode: "m" })).toBe(false);
    });
  });

  specimen.describe("Buffer.of", () => {
    specimen.it("no args returns base Buffer", () => {
      const schema = BufferSchema.of();
      specimen.expect(Value.Check(schema, { mode: "m", data: {} })).toBe(true);
    });

    specimen.it("narrows data fields", () => {
      const schema = BufferSchema.of({
        data: { recall: Type.String({ default: "LEARNING" }) },
      });
      specimen.expect(Value.Check(schema, { mode: "m", data: { recall: "KNOWN" } })).toBe(true);
    });

    specimen.it("narrows literals", () => {
      const schema = BufferSchema.of({
        literals: Type.Array(Ref),
      });
      specimen.expect(Value.Check(schema, {
        mode: "m",
        data: {},
        literals: ["lit-1"],
      })).toBe(true);
    });

    specimen.it("Value.Default fills defaults on empty", () => {
      const schema = BufferSchema.of({
        data: { recall: Type.String({ default: "LEARNING" }) },
      });
      const value = { mode: "m", data: {} };
      Value.Default(schema, value);
      specimen.expect(value.data.recall).toBe("LEARNING");
    });

    specimen.it("Value.Default retains provided values", () => {
      const schema = BufferSchema.of({
        data: { recall: Type.String({ default: "LEARNING" }) },
      });
      const value = { mode: "m", data: { recall: "KNOWN" } };
      Value.Default(schema, value);
      specimen.expect(value.data.recall).toBe("KNOWN");
    });

    specimen.it("Value.Default fills index default", () => {
      const schema = BufferSchema.of();
      const value = { mode: "m", data: {} };
      Value.Default(schema, value);
      specimen.expect(value.index).toBe(0);
    });
  });
});
