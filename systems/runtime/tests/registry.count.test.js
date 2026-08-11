import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import paladin from "@vivalence/paladin";
import { registry } from "../lifecycle/populate.js";

// A CENSUS, not a count. The old assertion pinned a literal (BASELINE + 8), so ordinary
// registry growth reddened it and the only repair was re-capturing the number — the act
// that makes the assertion meaningless. Nothing here names a registry MEMBER or its SIZE:
// every module lands under a stamped owner, every owner carries its own package manifest,
// and no owner+type ingests a slug twice. All three hold at any registry size.

const leaves = (pensieve) => {
  const found = [];
  for (const [owner, types] of pensieve)
    for (const [type, slugs] of types)
      for (const [slug, versions] of slugs) found.push({ owner, type, slug, versions: versions.size });
  return found;
};

describe("registry ingest", () => {
  it("lands every module under a stamped owner — nothing ownerless, nothing versionless", async () => {
    await registry();
    const ingested = leaves(paladin.vip.pensieve);

    expect(ingested.length).toBeGreaterThan(0);
    for (const { owner, type, slug, versions } of ingested) {
      expect(typeof owner === "string" && owner.startsWith("@")).toBe(true);
      expect(typeof type === "string" && type.length > 0).toBe(true);
      expect(typeof slug === "string" && slug.length > 0).toBe(true);
      expect(versions).toBeGreaterThan(0);
    }
  });

  // Deliberately NOT a list of expected owners: `@young-ladys-primer` is a real package on
  // disk that this variant does not mount, so naming the mounted set would pin the same kind
  // of literal the count did. The invariant is per-owner and survives mounting it later.
  it("gives every ingested owner a package-typed self-manifest — a mount without one cannot register", async () => {
    await registry();
    const ingested = leaves(paladin.vip.pensieve);
    const owners = [...new Set(ingested.map((leaf) => leaf.owner))];

    expect(owners.length).toBeGreaterThan(0);
    for (const owner of owners) {
      const owned = ingested.filter((leaf) => leaf.owner === owner);
      expect(owned.some((leaf) => leaf.type === "package")).toBe(true);
    }
  });

  it("keys a slug once per owner+type, so a mount cannot ingest the same module twice", async () => {
    await registry();
    const keys = leaves(paladin.vip.pensieve).map((leaf) => `${leaf.owner}/${leaf.type}/${leaf.slug}`);
    expect(keys.length).toBe(new Set(keys).size);
  });

  // lock-demo fixture assertion POSTPONED with the fixture itself — fork 4.
  // the LOCK mechanism is still covered, in vip.test.js, via an in-memory fixture.

  it("fork 2: multiplayer + localhost wafers resolve under @viva", async () => {
    await registry();
    const multiplayer = await paladin.vip.pensieve.revelio({ owner: "@viva", type: "variant", slug: "multiplayer" });
    const localhost = await paladin.vip.pensieve.revelio({ owner: "@viva", type: "variant", slug: "localhost" });
    expect(multiplayer).toBeTruthy();
    expect(localhost).toBeTruthy();
  });
});
