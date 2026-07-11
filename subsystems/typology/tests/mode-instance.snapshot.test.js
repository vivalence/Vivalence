// snapshot demo · mode-instance — a live Mode citizen (manifest + aperture machinery).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Mode, Aperture } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: mode-instance", () => {
  // mode-instance — live object with machinery → fold + omit["module"] + depth (the instance vantage)
  it("captures mode-instance", () => {
    const aperture = new Aperture();
    aperture.get("board", () => ({}));
    aperture.post("board", () => ({}));

    const mode = new Mode({
      manifest: { type: "game", slug: "nyan", traits: ["APPLICATION"] },
      aperture,
    });

    const { pojo, path } = snapshot(mode, {
      base,
      dry: DRY,
      locate: "mode-instance.snapshot.json",
      omit: ["module"],
      depth: 5,
    });
    console.log(`\n===BEGIN mode-instance → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.type).toBe("game");
    expect(pojo.slug).toBe("nyan");
    expect(pojo.manifest.traits).toEqual(["APPLICATION"]);
    expect(pojo.traits).toBeUndefined();
    expect(pojo.aperture.branches.board.effect).toBeTruthy();
    expect(pojo.module).toBeUndefined();
  });
});
