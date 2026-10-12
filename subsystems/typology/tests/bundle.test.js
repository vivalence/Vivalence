import { specimen, Bundle, App, svelte, mime, v } from "@vivalence/typology";

specimen.describe("Bundle prototype", () => {
  const svelteEntry = { mime: mime.dom.svelte, hash: "a".repeat(64), mount: "/aaaaaaaaaaaaaaaa.dom.svelte.mjs", integrity: "s1", bytes: 3 };
  const htmlEntry = { mime: mime.dom.html, hash: "b".repeat(64), mount: "/bbbbbbbbbbbbbbbb.dom.html.mjs", integrity: "s2", bytes: 4 };

  specimen.it("entry() finds by mime; json = entries (no url)", () => {
    const bundle = new Bundle({ entries: [svelteEntry], url: "http://h" });
    specimen.expect(bundle.entry(mime.dom.svelte).bytes).toBe(3);
    specimen.expect(bundle.entry(mime.dom.html)).toBe(undefined);
    specimen.expect(bundle.json).toEqual({ entries: [svelteEntry] });
    specimen.expect(new Bundle(bundle)).toBe(bundle);
  });

  specimen.it("negotiate() takes the first accepted mime the bundle offers", () => {
    const bundle = new Bundle({ entries: [svelteEntry, htmlEntry] });
    specimen.expect(bundle.negotiate([mime.tty.solid, mime.dom.html, mime.dom.svelte])).toBe(htmlEntry);
    specimen.expect(bundle.negotiate([mime.tty.solid])).toBe(null);
  });

  specimen.it("merge() keys by mime, the later entry wins; the sources are not mutated", () => {
    const first = new Bundle({ entries: [svelteEntry] });
    const replaced = { ...svelteEntry, hash: "c".repeat(64) };
    const merged = Bundle.merge(first, { entries: [htmlEntry] }, { entries: [replaced] });
    specimen.expect(merged.entries).toEqual([replaced, htmlEntry]);
    specimen.expect(first.entries).toEqual([svelteEntry]);
  });

  specimen.it("load() refuses a bundle that offers none of the accept line", async () => {
    await specimen.expect(new Bundle({ entries: [svelteEntry] }).load([mime.tty.solid])).rejects.toThrow("bundle offers none of");
  });
});

specimen.describe("App prototype", () => {
  specimen.it("a mount string names its mime by extension; a list is taken as declared; fill delegates Default-only", () => {
    const schema = v.buffer({ data: { recall: v.string({ default: "LEARNING" }) } });
    const a = new App("buffer/Reader.svelte", schema);
    specimen.expect(a.sources).toEqual([{ mime: mime.dom.svelte, mount: "buffer/Reader.svelte" }]);
    specimen.expect(new App("page.html").sources[0].mime).toBe(mime.dom.html);
    const declared = [{ mime: mime.dom.solid, mount: "app/Lesson.jsx" }, { mime: mime.tty.solid, mount: "terminal/Lesson.jsx" }];
    specimen.expect(new App(declared).sources).toBe(declared);
    specimen.expect(new App(a.sources, schema).sources).toBe(a.sources);
    specimen.expect(a.schema).toBe(schema);
    specimen.expect(a.fill({ data: {} }).recall).toBe("LEARNING");
    specimen.expect(new App(a)).toBe(a);
    specimen.expect(() => new App("buffer/Reader.vue")).toThrow("App: every source names a mime");
  });
});

specimen.describe("App source (m39)", () => {
  specimen.it("svelte`` yields {mime, source}; a list of it is an App's sources; an empty list throws", () => {
    const schema = v.buffer({ data: {} });
    const tag = svelte`<h1>hi ${"beef"}</h1>`;
    specimen.expect(tag).toEqual({ mime: mime.dom.svelte, source: "<h1>hi beef</h1>" });
    const a = new App([tag], schema);
    specimen.expect(a.sources).toEqual([tag]);
    specimen.expect(a.schema).toBe(schema);
    specimen.expect(() => new App([])).toThrow("App: every source names a mime");
  });
});
