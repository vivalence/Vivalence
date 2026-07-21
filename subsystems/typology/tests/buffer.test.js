import { specimen, App, v } from "@vivalence/typology";

specimen.describe("App", () => {
  specimen.it("an app fills buffers through its schema untouched", () => {
    const app = new App("test.svelte", v.buffer({
      data: { recall: v.string({ default: "LEARNING" }) },
    }));
    specimen.expect(app.fill({ data: {}, literals: [{ id: "hello" }] }).recall).toBe("LEARNING");
    specimen.expect(app.fill({ data: { recall: "KNOWN" } }).recall).toBe("KNOWN");
    specimen.expect(app.fill({ data: {} }).recall).toBe("LEARNING");
    specimen.expect(app.fill().recall).toBe("LEARNING");
  });
});
