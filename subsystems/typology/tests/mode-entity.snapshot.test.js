// snapshot demo · mode-entity — the v.mode() typebox schema (entityFactory Intersect).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, v } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: mode-entity", () => {
  // mode-entity — already typebox JSON → identity parse (no fold)
  it("captures mode-entity", () => {
    const { pojo, path } = snapshot(v.mode(), {
      base,
      dry: DRY,
      locate: "mode-entity.snapshot.json",
      parse: (schema) => schema,
    });
    console.log(`\n===BEGIN mode-entity → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.$id).toBe("Mode");
    expect(Array.isArray(pojo.allOf)).toBe(true);
  });
});
