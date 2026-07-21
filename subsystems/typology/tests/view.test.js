import { specimen, Bundle, View, App, Path, v } from "@vivalence/typology";

specimen.describe("Bundle prototype", () => {
  specimen.it("record|array form; entry() finds by mount; json = entries (no url)", () => {
    const b = new Bundle({ entries: [{ type: "js", mount: "/x.mjs", bytes: 3 }], url: "http://h" });
    specimen.expect(b.entry("/x.mjs").bytes).toBe(3);
    specimen.expect(b.json).toEqual({ entries: [{ type: "js", mount: "/x.mjs", bytes: 3 }] });
    specimen.expect(new Bundle([{ type: "js", mount: "/y", bytes: 1 }]).entries.length).toBe(1);
    specimen.expect(new Bundle(b)).toBe(b);
  });
});

specimen.describe("View prototype", () => {
  specimen.it("pojo/string tolerant; kind from ext; json canonical; hash omitted when null", () => {
    const record = {
      kind: "svelte",
      hash: "deadbeef",
      mount: "/a.svelte.mjs",
      bundle: { entries: [{ type: "js", mount: "/a.svelte.mjs", bytes: 4 }] },
    };
    const view = new View(record);
    specimen.expect(view.mount).toBeInstanceOf(Path);
    specimen.expect(view.json).toEqual(record);
    specimen.expect(new View(view)).toBe(view);

    const app = new View({ mount: "/Reader.svelte", bundle: { entries: [] } });
    specimen.expect(app.kind).toBe("svelte");
    specimen.expect(app.json.hash).toBe(undefined);
  });
});

specimen.describe("App prototype", () => {
  specimen.it("string|{mount,schema}|App ctor; mount to Path; fill delegates Default-only", () => {
    const schema = v.buffer({ data: { recall: v.string({ default: "LEARNING" }) } });
    const a = new App("buffer/Reader.svelte", schema);
    specimen.expect(a.mount).toBeInstanceOf(Path);
    specimen.expect(a.schema).toBe(schema);
    specimen.expect(a.fill({ data: {} }).recall).toBe("LEARNING");
    specimen.expect(new App({ mount: "x", schema }).schema).toBe(schema);
    specimen.expect(new App(a)).toBe(a);
  });
});
