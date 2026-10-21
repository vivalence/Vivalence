import { belt, specimen, v } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;

describe("snapshot: file-entity", () => {
  it("captures file-entity — path · mount · mime · hash · integrity · bytes own, mode · view · buffers related", () => {
    const { pojo } = snapshot(v.file(), { base, locate: "file-entity.snapshot.json", parse: (schema) => schema });
    expect(pojo.$id).toBe("File");
    expect(Object.keys(pojo.allOf[1].properties).sort()).toEqual(["bytes", "hash", "integrity", "mime", "mount", "path", "trait", "traits"]);
    expect(Object.keys(pojo.allOf[2].properties).sort()).toEqual(["buffers", "mode", "view"]);
  });

  it("a file row checks and fills bytes; MISSING is the one claim it carries", () => {
    const row = { mode: "m-1", path: "board.js", mount: "/tmp/x/board.js", mime: "text/javascript", hash: "9f86", integrity: "sha256-n4bQ" };
    expect(v.file().check(row)).toBe(true);
    expect(v.file().cast(row).bytes).toBe(0);
    expect(v.file().check({ ...row, view: "v-1" })).toBe(true);
    expect(Object.keys(v.file.traits.properties)).toEqual(["MISSING"]);
    expect(belt.traits.cast({ id: "f-1", traits: ["MISSING"], trait: { MISSING: { since: "2026-10-21T09:00:00Z" } } }, v.file.traits).MISSING).toEqual({ since: "2026-10-21T09:00:00Z" });
    expect(belt.traits.cast({ id: "f-1", traits: [], trait: {} }, v.file.traits).MISSING).toEqual({});
    expect(() => belt.traits.cast({ id: "f-1", traits: ["RENDERED"], trait: {} }, v.file.traits)).toThrow("no trait RENDERED in a vocabulary of MISSING");
  });
});
