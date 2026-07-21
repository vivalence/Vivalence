import { specimen, v } from "@vivalence/typology";

// The two contractual (wire/persisted) shapes, from the schematic.
const Bundle = v.prototypes.Bundle();
const View = v.prototypes.View();

// Server-internal / per-tool contracts — pinned locally (not persisted, so no schematic).
const Nascent = v.object({ kind: v.string(), source: v.string({ minLength: 1 }) });
const Served = v.object({ text: v.string(), type: v.const("application/javascript"), integrity: v.string() });
const AppMetadata = v.object({ url: v.string(), schema: v.any(), view: View });

specimen.describe("generative view contracts", () => {
  specimen.it("Bundle pins each entry (type, mount, bytes; integrity optional); requires >= 1", () => {
    specimen.expect(Bundle.check({ entries: [{ type: "js", mount: "/a.mjs", bytes: 12 }] })).toBe(true);
    specimen.expect(Bundle.check({ entries: [{ type: "js", mount: "/a.mjs", integrity: "sha", bytes: 12 }] })).toBe(true);

    specimen.expect(Bundle.check({ entries: [] })).toBe(false); // minItems: 1
    specimen.expect(Bundle.check({ entries: [{ type: "js", mount: "/a.mjs" }] })).toBe(false); // no bytes
    specimen.expect(Bundle.check({ entries: [{ mount: "/a.mjs", bytes: 1 }] })).toBe(false); // no type
    specimen.expect(Bundle.check({})).toBe(false); // no entries
  });

  specimen.it("View wraps ONE bundle; hash optional (app has none, gen does)", () => {
    const bundle = { entries: [{ type: "js", mount: "/x.svelte.mjs", integrity: "s", bytes: 9 }] };
    specimen.expect(View.check({ kind: "svelte", mount: "/x.svelte.mjs", bundle })).toBe(true); // app: no hash
    specimen.expect(View.check({ kind: "svelte", hash: "deadbeef", mount: "/x.svelte.mjs", bundle })).toBe(true); // gen

    specimen.expect(View.check({ mount: "/x", bundle })).toBe(false); // no kind
    specimen.expect(View.check({ kind: "svelte", bundle })).toBe(false); // no mount
    specimen.expect(View.check({ kind: "svelte", mount: "/x" })).toBe(false); // no bundle
    specimen.expect(View.check({ kind: "svelte", mount: "/x", bundle: { entries: [] } })).toBe(false); // empty bundle
  });

  specimen.it("Nascent is the bundler input — kind + non-empty source", () => {
    specimen.expect(Nascent.check({ kind: "svelte", source: "<h1/>" })).toBe(true);
    specimen.expect(Nascent.check({ kind: "svelte", source: "" })).toBe(false);
    specimen.expect(Nascent.check({ kind: "svelte" })).toBe(false);
  });

  specimen.it("Served is the serve() payload — js mime + integrity", () => {
    specimen.expect(Served.check({ text: "export default", type: "application/javascript", integrity: "sha" })).toBe(true);
    specimen.expect(Served.check({ text: "x", type: "text/html", integrity: "sha" })).toBe(false);
    specimen.expect(Served.check({ text: "x", type: "application/javascript" })).toBe(false);
  });

  specimen.it("/metadata/app carries the declaration + boot view", () => {
    const view = { kind: "svelte", mount: "/Reader.svelte", bundle: { entries: [{ type: "js", mount: "/Reader.svelte", bytes: 5 }] } };
    specimen.expect(AppMetadata.check({ url: "https://x/attached/bundle", schema: {}, view })).toBe(true);
    specimen.expect(AppMetadata.check({ url: "https://x", schema: {} })).toBe(false); // no view
  });
});
