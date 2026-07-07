// snapshot demo · path — headless (no daemon/db).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Path } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: path", () => {
  // path — Signature with .json → parse-override for the full structure
  it("captures path", () => {
    const { pojo, path } = snapshot(new Path("/mode/game/nyan"), {
      base,
      dry: DRY,
      locate: "path.snapshot.json",
      parse: (p) => p.json,
    });
    console.log(`\n===BEGIN path → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toEqual({
      nature: "/mode/game/nyan",
      absolute: "/mode/game/nyan",
      filename: null,
      dirname: "/mode/game",
    });
  });
});
