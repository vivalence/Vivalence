// snapshot demo · aperture — an Aperture (Vector + method-keyed leaves) → shape.strip contract.
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Aperture } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: aperture", () => {
  // aperture — Vector subclass → shape.strip contract {leaves, branches}; branch nests the trie
  it("captures aperture", () => {
    const app = new Aperture();
    app.get("board", () => ({}));
    app.post("board", () => ({}));
    const api = app.branch("api");
    api.get("items", () => []);

    const { pojo, path } = snapshot(app, {
      base,
      dry: DRY,
      locate: "aperture.snapshot.json",
    });
    console.log(`\n===BEGIN aperture → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.leaves[0].nature).toBe("board");
    expect(pojo.branches.api.leaves[0].nature).toBe("items");
  });
});
