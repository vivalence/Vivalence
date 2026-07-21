// snapshot demo · signal — headless (no daemon/db).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Signal } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: signal", () => {
  // signal — Signature with .json → parse-override for the full structure
  it("captures signal", () => {
    const { pojo, path } = snapshot(new Signal("play --gameplay PLAIN cat dog"), {
      base,
      dry: DRY,
      locate: "signal.snapshot.json",
      parse: (s) => s.json,
    });
    console.log(`\n===BEGIN signal → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toEqual({
      signal: "/play/cat/dog",
      parts: ["play", "cat", "dog"],
      flags: { gameplay: "PLAIN" },
    });
  });
});
