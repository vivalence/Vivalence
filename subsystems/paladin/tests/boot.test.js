import { specimen } from "@vivalence/typology";
import { Path } from "@vivalence/typology";
import { Paladin, Ledger, Instance, Registry, populate, mount } from "@vivalence/paladin/typology";
import paladin from "@vivalence/paladin";

const { describe, it, expect } = specimen;

describe("paladin boot: constructed mountables, no ikiro", () => {
  it("constructor wires the ledger; the registry is the ledger's, held once — the lifecycle populates the instance", () => {
    const fresh = new Paladin();
    expect(fresh.ledger).toBeInstanceOf(Ledger);
    fresh.scopes([["ledger", () => true, () => new Path("/tmp/boot")]]);
    expect(fresh.ledger.registry).toBeInstanceOf(Registry);
    expect(fresh.ledger.registry).toBe(fresh.ledger.registry);
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

  it("the booted default export holds one registry and an instance from the lifecycle", () => {
    expect(paladin.ledger.registry).toBeInstanceOf(Registry);
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
