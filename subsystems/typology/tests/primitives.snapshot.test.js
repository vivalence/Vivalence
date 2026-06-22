// snapshot demo · typology primitives — 5 subjects, headless (no daemon/db).
// Step 1: DRY — console.log each pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, v, Vector, Url, Path, Signal } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: typology primitives", () => {
  const vector = new Vector();
  vector.open({ nature: "/drill", input: v.object({ count: v.integer({ minimum: 1 }) }) }, async () => {});
  vector.open({ nature: "/coach" }, async () => {});

  // each subject demos a distinct fold path:
  //   v-literal — already typebox JSON → identity parse (no fold)
  //   vector    — Vector → shape.strip contract {leaves,branches}
  //   url       — Signature with .json → parse-override for the full structure
  //   path·signal — raw → isPath collapses a routing node to its nature string (by design)
  const subjects = [
    ["v-literal", v.literal(), { parse: (schema) => schema }],
    ["vector", vector, {}],
    ["url", new Url("http://localhost:2501/daemon/brazilian/metadata/modes?depth=3"), { parse: (url) => url.json }],
    ["path", new Path("/mode/game/nyan"), {}],
    ["signal", new Signal("play --gameplay PLAIN cat dog"), {}],
  ];

  for (const [name, subject, opts] of subjects) {
    it(`captures ${name}`, () => {
      const { pojo, path } = snapshot(subject, { base, dry: DRY, locate: `${name}-demo.snapshot.json`, ...opts });
      console.log(`\n===BEGIN ${name} → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
      expect(pojo).toBeTruthy();
    });
  }
});
