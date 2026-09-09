import paladin, { lifecycle } from "@vivalence/paladin";
import { specimen } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;
const FIXTURE = "commons/instances/hello-world";

const redact = (node) =>
  Array.isArray(node)
    ? node.map(redact)
    : node && typeof node === "object"
      ? Object.fromEntries(
          Object.entries(node).map(([key, value]) => [
            key,
            key === "secrets" ? Object.fromEntries(Object.keys(value ?? {}).map((slot) => [slot, "***"])) : redact(value),
          ]),
        )
      : node;

describe("snapshot demo: paladin", () => {
  it("instance — the resolved deployment, secrets redacted, the paladin spine cut", async () => {
    paladin.env.set("VIVA_INSTANCE_MOUNT", paladin.scope.repository.branch(FIXTURE).absolute, "flag");
    await lifecycle.mount(paladin.instance);
    const folded = snapshot(paladin.instance, { base, depth: 6, omit: ["paladin"], write: false }).pojo;
    const { pojo, path } = snapshot(redact(folded), { base, dry: DRY, parse: (held) => held, locate: "paladin-instance.snapshot.json" });
    console.log(`\n===BEGIN paladin.instance → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toBeTruthy();
    expect(JSON.stringify(pojo)).not.toContain("sk-ant");
  });

  it("scope — the resolved directory paths", () => {
    const { pojo, path } = snapshot(paladin.scope, { base, dry: DRY, locate: "paladin-scope.snapshot.json" });
    console.log(`\n===BEGIN paladin.scope → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toBeTruthy();
  });
});
