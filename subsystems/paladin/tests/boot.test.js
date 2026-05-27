import { specimen } from "@vivalence/typology";
import { Paladin, System, Variant, Vip } from "@vivalence/paladin/typology";
import paladin from "@vivalence/paladin";

const { describe, it, expect } = specimen;

describe("paladin boot: constructed mountables, no ikiro", () => {
  it("constructor wires system/variant/vip as siblings", () => {
    const fresh = new Paladin();
    expect(fresh.system).toBeInstanceOf(System);
    expect(fresh.variant).toBeInstanceOf(Variant);
    expect(fresh.vip).toBeInstanceOf(Vip);
  });

  it("a fresh paladin carries no ikiro promise", () => {
    expect(new Paladin().ikiro).toBe(undefined);
  });

  it("the booted default export carries no ikiro promise", () => {
    expect(paladin.ikiro).toBe(undefined);
  });

  it("the booted default export already has vip from construction", () => {
    expect(paladin.vip).toBeInstanceOf(Vip);
  });

  it("variant.mount is the once-wrapped lazy mount", () => {
    expect(typeof new Paladin().variant.mount).toBe("function");
  });
});
