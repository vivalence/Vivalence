// snapshot demo · vector — headless (no daemon/db).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, v, Vector } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: vector", () => {
  // vector — Vector → shape.strip contract {leaves,branches}
  it("captures vector", () => {
    const vector = new Vector();
    vector.open({ nature: "/drill", input: v.object({ count: v.integer({ minimum: 1 }) }) }, async () => {});
    vector.open({ nature: "/coach" }, async () => {});

    const { pojo, path } = snapshot(vector, {
      base,
      dry: DRY,
      locate: "vector.snapshot.json",
    });
    console.log(`\n===BEGIN vector → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo.branches).toEqual({});
    expect(pojo.leaves).toHaveLength(2);
    expect(pojo.leaves[0].nature).toBe("drill");
    expect(pojo.leaves[0].input.properties.count.minimum).toBe(1);
    expect(pojo.leaves[1].nature).toBe("coach");
  });
});
