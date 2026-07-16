import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import paladin from "@vivalence/paladin";
import { registry } from "../lifecycle/populate.js";

const BASELINE = 38; // ② capture, this session — 4-branch mount, pensieve leaf count

const count = (pensieve) => {
  let total = 0;
  for (const ownerMap of pensieve.values())
    for (const typeMap of ownerMap.values())
      for (const slugMap of typeMap.values()) total += slugMap.size;
  return total;
};

describe("registry ingest", () => {
  it("four-package mount ingests baseline + 4 self-manifests + 2 wafers (variant lives in testament now)", async () => {
    await registry();
    expect(count(paladin.vip.pensieve)).toBe(BASELINE + 8); // +2 @fixtures (package + language-learning fixture)
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
