import { specimen, v } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;

describe("snapshot: view-entity", () => {
  it("captures view-entity — slug · mime · entry own, mode · files · buffers related", () => {
    const { pojo } = snapshot(v.view(), { base, locate: "view-entity.snapshot.json", parse: (schema) => schema });
    expect(pojo.$id).toBe("View");
    expect(Array.isArray(pojo.allOf)).toBe(true);
    const own = pojo.allOf[1].properties;
    expect(Object.keys(own).sort()).toEqual(["entry", "mime", "slug", "trait", "traits"]);
    expect(own.mime.title).toBe("RFC 6838 media type (type/[tree.]subtype[+suffix])");
    expect(Object.keys(pojo.allOf[2].properties).sort()).toEqual(["buffers", "files", "mode"]);
  });

  it("a view row checks; the mime must be an RFC 6838 media type", () => {
    const row = { id: "v-1", mode: "m-1", slug: "play", mime: "application/vnd.viva.tty.solid+javascript", entry: "board.js" };
    expect(v.view().check(row)).toBe(true);
    expect(v.view().check({ ...row, mime: "not a mime" })).toBe(false);
    expect(v.view().faults({ ...row, mime: "not a mime" })[0].at).toBe("/mime");
  });

  it("a buffer names its views and turns; a turn names its buffers", () => {
    const view = { mode: "m-1", slug: "play", mime: "application/vnd.viva.tty.solid+javascript", entry: "board.js" };
    expect(v.buffer().check({ mode: "m-1", thread: "th-1", views: [view], turns: [{ role: "user", thread: "th-1" }], files: [] })).toBe(true);
    expect(v.buffer().check({ mode: "m-1", thread: "th-1", views: ["v-1"] })).toBe(false);
    expect(v.turn().check({ role: "user", thread: "th-1", buffers: [{ mode: "m-1", thread: "th-1", data: {} }] })).toBe(true);
    expect(v.buffer.traits.properties.LABELED.$id).toBe("Label");
  });
});
