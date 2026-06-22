// snapshot demo · paladin — 2 subjects (the resolved deployment + the scope paths).
// Step 1: DRY — console.log each pojo + resolved path. Step 2: write + read back.
// Needs env: deno test -A --no-check --env-file=testament/.env .../variant.snapshot.test.js
import paladin from "@vivalence/paladin";
import { specimen } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: paladin", () => {
  it("variant — the resolved deployment", async () => {
    await paladin.variant.mount();
    const { pojo, path } = snapshot(paladin.variant, { base, dry: DRY, depth: 6, locate: "paladin-variant.snapshot.json" });
    console.log(`\n===BEGIN paladin.variant → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toBeTruthy();
  });

  it("scope — the resolved directory paths", () => {
    const { pojo, path } = snapshot(paladin.scope, { base, dry: DRY, locate: "paladin-scope.snapshot.json" });
    console.log(`\n===BEGIN paladin.scope → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toBeTruthy();
  });
});
