import { specimen, fn, sleep } from "@vivalence/typology";
import { Cargo } from "../src/typology/prototypes/cargo.js";

specimen.describe("cargo — the client catalog consumer", () => {
  specimen.it("resolves a held path without touching the wire", async () => {
    let calls = 0;
    const cargo = new Cargo({ call: async () => (calls++, {}) });
    cargo.catalog = { "audio/sentences/held.mp3": { url: "/cargo/held" } };
    specimen.expect(cargo.resolve({ path: "audio/sentences/held.mp3" })?.url).toBe("/cargo/held");
    await sleep.ms(10);
    specimen.expect(calls).toBe(0);
  });

  specimen.it("a missed path triggers ONE debounced refetch, then resolves fresh", async () => {
    let calls = 0;
    const cargo = new Cargo({
      call: async () => (calls++, { "audio/sentences/fresh.mp3": { url: "/cargo/fresh" } }),
    });
    cargo.refresh = fn.debounce(() => cargo.refetch(), 5);
    specimen.expect(cargo.resolve({ path: "audio/sentences/fresh.mp3" })).toBe(null);
    cargo.resolve({ path: "audio/sentences/fresh.mp3" });
    cargo.resolve({ path: "audio/sentences/fresh.mp3" });
    await sleep.ms(20);
    specimen.expect(calls).toBe(1);
    specimen.expect(cargo.resolve({ path: "audio/sentences/fresh.mp3" })?.url).toBe("/cargo/fresh");
  });

  specimen.it("an absent asset refetches once and can never loop", async () => {
    let calls = 0;
    const cargo = new Cargo({ call: async () => (calls++, {}) });
    cargo.refresh = fn.debounce(() => cargo.refetch(), 5);
    specimen.expect(cargo.resolve({ path: "audio/sentences/ghost.mp3" })).toBe(null);
    await sleep.ms(20);
    cargo.resolve({ path: "audio/sentences/ghost.mp3" });
    cargo.resolve({ path: "audio/sentences/ghost.mp3" });
    await sleep.ms(20);
    specimen.expect(calls).toBe(1);
  });

  specimen.it("resolves by slug across the catalog", () => {
    const cargo = new Cargo({ call: async () => ({}) });
    cargo.catalog = { "audio/sentences/grazie-mille.mp3": { url: "/cargo/grazie" } };
    specimen.expect(cargo.resolve({ slug: "grazie-mille.mp3" })?.url).toBe("/cargo/grazie");
    specimen.expect(cargo.resolve({ slug: "assente.mp3" })).toBe(null);
  });
});
