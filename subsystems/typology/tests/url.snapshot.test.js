// snapshot demo · url — headless (no daemon/db).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, Url } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

describe("snapshot demo: url", () => {
  // url — Signature with .json → parse-override for the full structure
  it("captures url", () => {
    const { pojo, path } = snapshot(
      new Url("http://localhost:2501/daemon/brazilian/metadata/modes?depth=3"),
      {
        base,
        dry: DRY,
        locate: "url.snapshot.json",
        parse: (url) => url.json,
      },
    );
    console.log(`\n===BEGIN url → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
    expect(pojo).toEqual({
      nature: "/daemon/brazilian/metadata/modes",
      absolute: "http://localhost:2501/daemon/brazilian/metadata/modes?depth=3",
      origin: "http://localhost:2501",
    });
  });
});
