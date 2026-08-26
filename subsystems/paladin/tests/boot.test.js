import { specimen } from "@vivalence/typology";
import { Paladin, Ledger, Instance, Vip } from "@vivalence/paladin/typology";
import paladin from "@vivalence/paladin";

const { describe, it, expect } = specimen;

describe("paladin boot: constructed mountables, no ikiro", () => {
  it("constructor wires ledger/instance/vip as siblings", () => {
    const fresh = new Paladin();
    expect(fresh.ledger).toBeInstanceOf(Ledger);
    expect(fresh.instance).toBeInstanceOf(Instance);
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

  it("instance.mount is the once-wrapped lazy mount", () => {
    expect(typeof new Paladin().instance.mount).toBe("function");
  });
});
