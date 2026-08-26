// snapshot demo · paladin — 2 subjects (the resolved deployment + the scope paths).
// Step 1: DRY — console.log each pojo + resolved path. Step 2: write + read back.
//
// Mounts the IN-REPO @viva/instance/hello-world. It used to mount whatever the ambient
// VIVA_INSTANCE_MOUNT happened to name — a deployment fact — so it broke every time the dev
// instance moved, was renamed, or had its env line commented out. A test owns its fixture.
import paladin from "@vivalence/paladin";
import { specimen } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;
const FIXTURE = "registry/viva/instances/hello-world";

describe("snapshot demo: paladin", () => {
  it("instance — the resolved deployment", async () => {
    paladin.env.set("VIVA_INSTANCE_MOUNT", paladin.scope.repository.branch(FIXTURE).absolute, "flag");
    await paladin.instance.mount();
    const { pojo, path } = snapshot(paladin.instance, { base, dry: DRY, depth: 6, locate: "paladin-instance.snapshot.json" });
    console.log(`\n===BEGIN paladin.instance → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toBeTruthy();
  });

  it("scope — the resolved directory paths", () => {
    const { pojo, path } = snapshot(paladin.scope, { base, dry: DRY, locate: "paladin-scope.snapshot.json" });
    console.log(`\n===BEGIN paladin.scope → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toBeTruthy();
  });
});
