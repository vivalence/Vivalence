import { specimen, mime, v } from "@vivalence/typology";

const Bundle = v.prototypes.Bundle();

const Nascent = v.object({ mime: v.mime(), source: v.string({ minLength: 1 }) });
const Served = v.object({ text: v.string(), type: v.const("text/javascript"), integrity: v.string() });
const AppMetadata = v.object({ url: v.string(), schema: v.any(), bundle: Bundle });

const entry = { mime: mime.dom.svelte, hash: "d".repeat(64), mount: "/dddddddddddddddd.dom.svelte.mjs", integrity: "s", bytes: 9 };

specimen.describe("bundle contracts", () => {
  specimen.it("Bundle pins each entry (mime, hash, mount, integrity, bytes); requires >= 1", () => {
    specimen.expect(Bundle.check({ entries: [entry] })).toBe(true);
    specimen.expect(Bundle.check({ entries: [entry, { ...entry, mime: mime.tty.solid }] })).toBe(true);

    specimen.expect(Bundle.check({ entries: [] })).toBe(false);
    specimen.expect(Bundle.check({ entries: [{ ...entry, mime: "svelte" }] })).toBe(false);
    specimen.expect(Bundle.check({ entries: [{ ...entry, integrity: undefined }] })).toBe(false);
    specimen.expect(Bundle.check({ entries: [{ ...entry, hash: undefined }] })).toBe(false);
    specimen.expect(Bundle.check({})).toBe(false);
  });

  specimen.it("v.mime is the RFC 6838 production", () => {
    for (const type of [mime.dom.svelte, mime.tty.solid, mime.markdown, mime.json, mime.svg]) specimen.expect(v.mime().check(type)).toBe(true);
    for (const type of ["svelte", "text/", "application/vnd.vivalence.dom svelte"]) specimen.expect(v.mime().check(type)).toBe(false);
  });

  specimen.it("Nascent is the bundler input — a mime + non-empty source", () => {
    specimen.expect(Nascent.check({ mime: mime.dom.svelte, source: "<h1/>" })).toBe(true);
    specimen.expect(Nascent.check({ mime: mime.dom.svelte, source: "" })).toBe(false);
    specimen.expect(Nascent.check({ source: "<h1/>" })).toBe(false);
  });

  specimen.it("Served is the serve() payload — text/javascript + integrity", () => {
    specimen.expect(Served.check({ text: "export default", type: "text/javascript", integrity: "sha" })).toBe(true);
    specimen.expect(Served.check({ text: "x", type: "application/javascript", integrity: "sha" })).toBe(false);
    specimen.expect(Served.check({ text: "x", type: "text/javascript" })).toBe(false);
  });

  specimen.it("/metadata/application carries the declaration + the boot bundle", () => {
    specimen.expect(AppMetadata.check({ url: "https://x/attached/bundle", schema: {}, bundle: { entries: [entry] } })).toBe(true);
    specimen.expect(AppMetadata.check({ url: "https://x", schema: {} })).toBe(false);
  });
});
