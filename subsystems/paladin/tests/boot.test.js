import { specimen } from "@vivalence/typology";
import { Paladin, Ledger, Instance, Vip, populate, mount } from "@vivalence/paladin/typology";
import paladin from "@vivalence/paladin";

const { describe, it, expect } = specimen;

describe("paladin boot: constructed mountables, no ikiro", () => {
  it("constructor wires ledger/vip as siblings — the lifecycle populates the instance", () => {
    const fresh = new Paladin();
    expect(fresh.ledger).toBeInstanceOf(Ledger);
    expect(fresh.vip).toBeInstanceOf(Vip);
    expect(fresh.instance).toBe(undefined);
    expect(populate.instance(fresh)).toBeInstanceOf(Instance);
    expect(fresh.instance).toBeInstanceOf(Instance);
  });

  it("a fresh paladin carries no ikiro promise", () => {
    expect(new Paladin().ikiro).toBe(undefined);
  });

  it("the booted default export carries no ikiro promise", () => {
    expect(paladin.ikiro).toBe(undefined);
  });

  it("the booted default export already has vip from construction and an instance from the lifecycle", () => {
    expect(paladin.vip).toBeInstanceOf(Vip);
    expect(paladin.instance).toBeInstanceOf(Instance);
  });

  it("lifecycle.mount is memoized per instance — the same promise twice, a fresh instance mounts anew", async () => {
    const fresh = new Paladin();
    const first = mount(populate.instance(fresh));
    await first.catch(() => null);
    expect(mount(fresh.instance)).toBe(first);
    const second = mount(populate.instance(fresh));
    await second.catch(() => null);
    expect(second).not.toBe(first);
  });
});
