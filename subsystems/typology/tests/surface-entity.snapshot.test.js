import { specimen, v } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;

describe("snapshot: view-entity", () => {
  it("captures view-entity — slug · mime · mount · entry own, mode · files · buffers related", () => {
    const { pojo } = snapshot(v.surface(), { base, locate: "view-entity.snapshot.json", parse: (schema) => schema });
    expect(pojo.$id).toBe("Surface");
    expect(Array.isArray(pojo.allOf)).toBe(true);
    const own = pojo.allOf[1].properties;
    expect(Object.keys(own).sort()).toEqual(["entry", "mime", "mount", "slug", "trait", "traits"]);
    expect(own.mime.title).toBe("RFC 6838 media type (type/[tree.]subtype[+suffix])");
    expect(Object.keys(pojo.allOf[2].properties).sort()).toEqual(["buffers", "files", "mode"]);
  });

  it("a surface row checks; the mime must be an RFC 6838 media type", () => {
    const row = { id: "v-1", mode: "m-1", slug: "play", mime: "application/vnd.viva.tty.solid+javascript", entry: "board.js" };
    expect(v.surface().check(row)).toBe(true);
    expect(v.surface().check({ ...row, mime: "not a mime" })).toBe(false);
    expect(v.surface().faults({ ...row, mime: "not a mime" })[0].at).toBe("/mime");
  });

  it("a buffer names its surfaces and turns; a turn names its buffers", () => {
    const surface = { mode: "m-1", slug: "play", mime: "application/vnd.viva.tty.solid+javascript", entry: "board.js" };
    expect(v.buffer().check({ mode: "m-1", thread: "th-1", surfaces: [surface], turns: [{ role: "user", thread: "th-1" }], files: [] })).toBe(true);
    expect(v.buffer().check({ mode: "m-1", thread: "th-1", surfaces: ["v-1"] })).toBe(false);
    expect(v.turn().check({ role: "user", thread: "th-1", buffers: [{ mode: "m-1", thread: "th-1", data: {} }] })).toBe(true);
    expect(v.buffer.traits.properties.LABELED.$id).toBe("Label");
  });
});
