import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, Url } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";

// an in-memory pensieve: modules under @probe, no disk. accio and wire fold over what revelio hands back.
const boot = (modules) => {
  const paladin = new Paladin();
  paladin.scopes([["ledger", () => true, () => new Path("/fixtures/wire")]]);
  const registry = paladin.ledger.registry;
  for (const module of modules) registry.pensieve.register({ ...module, source: new Path(`/fixtures/wire/${module.manifest.slug}.viva.js`) });
  return registry;
};

const MODULES = [
  { manifest: { owner: "@probe", type: "package", slug: "probe", version: "0.0.1" } },
  { manifest: { owner: "@probe", type: "domain", slug: "chess", version: "0.0.1", traits: [] }, entities: {}, statics: { depth: 3, seed: 1 } },
  { manifest: { owner: "@probe", type: "game", slug: "board", version: "0.0.1", traits: ["EXPOSED"] }, aperture: () => {}, statics: { theme: "wood" } },
  { manifest: { owner: "@probe", type: "lighthouse", slug: "light", version: "0.0.1" }, provider: (citizen) => citizen },
  { manifest: { owner: "@probe", type: "datamap", slug: "map", version: "0.0.1" }, provider: (citizen) => citizen },
];

describe("registry.accio — mask ⊕ module, once", () => {
  it("a bare identifier is the module, untouched", async () => {
    const registry = boot(MODULES);
    const module = await registry.accio("@probe/game/board");
    expect(module.manifest.slug).toBe("board");
    expect(module.statics).toEqual({ theme: "wood" });
    expect(module.identifier).toBeUndefined();
  });

  it("a mask folds manifest and statics by key, mask winning; secrets and the seat are the mask's; module and identifier ride along", async () => {
    const registry = boot(MODULES);
    const citizen = await registry.accio({
      module: "@probe/game/board",
      manifest: { slug: "board-2" },
      statics: { size: 8 },
      secrets: { key: "k" },
      mountpoint: new Path("/seat"),
    });
    expect(citizen.manifest).toMatchObject({ owner: "@probe", type: "game", slug: "board-2", traits: ["EXPOSED"] });
    expect(citizen.statics).toEqual({ theme: "wood", size: 8 });
    expect(citizen.secrets).toEqual({ key: "k" });
    expect(citizen.mountpoint.absolute).toBe("/seat");
    expect(citizen.identifier).toBe("@probe/game/board");
    expect(citizen.module.manifest.slug).toBe("board");
    expect(typeof citizen.aperture).toBe("function");
  });

  it("a mask without statics or secrets still yields both keys — no ?? downstream", async () => {
    const registry = boot(MODULES);
    const citizen = await registry.accio({ module: "@probe/domain/chess" });
    expect(citizen.statics).toEqual({ depth: 3, seed: 1 });
    expect(citizen.secrets).toEqual({});
    expect(citizen.mountpoint).toBe(null);
  });

  it("an inline module is its own citizen", async () => {
    const registry = boot(MODULES);
    const inline = { manifest: { type: "game", slug: "inline", version: "0.0.1", traits: [] } };
    const citizen = await registry.accio(inline);
    expect(citizen.module).toBe(inline);
    expect(citizen.identifier).toBe(null);
  });

});

describe("registry.wire — a daemon mask to its bag", () => {
  const mask = {
    manifest: { type: "daemon", slug: "d", version: "0.0.1" },
    lighthouse: { module: "@probe/lighthouse/light" },
    datamap: { module: "@probe/datamap/map", statics: { db: { file: "d.viva.db" } } },
    hallucinators: [],
    consume: { light: { module: "@probe/lighthouse/light" } },
    kernel: [{ module: "@probe/domain/chess", mountpoint: new Path("/m/chess") }, { module: "@probe/game/board", mountpoint: new Path("/m/board") }],
  };

  it("every slot is a citizen; the kernel keeps its order; the domain is picked from it", async () => {
    const bag = await boot(MODULES).wire(mask);
    expect(bag.lighthouse.provider(bag.lighthouse).manifest.slug).toBe("light");
    expect(bag.datamap.statics).toEqual({ db: { file: "d.viva.db" } });
    expect(bag.hallucinators).toEqual([]);
    expect(Object.keys(bag.consume)).toEqual(["light"]);
    expect(bag.kernel.map((citizen) => citizen.manifest.slug)).toEqual(["chess", "board"]);
    expect(bag.domain.manifest.slug).toBe("chess");
  });

  it("a kernel without a domain wires an empty domain, not a throw", async () => {
    const bag = await boot(MODULES).wire({ ...mask, kernel: [mask.kernel[1]] });
    expect(bag.domain.manifest?.slug).toBeUndefined();
    expect(bag.domain.entities ?? {}).toEqual({});
  });

  it("an entry that arrives unseated is seated in wire from the folded manifest; a seated one is left alone", async () => {
    const seated = { ...mask, mount: new Path("/daemon/d"), url: new Url("http://x/daemon/d"), mountpoint: new Path("/m/d") };
    const bag = await boot(MODULES).wire({ ...seated, kernel: [mask.kernel[1], { ...mask.kernel[0], mount: new Path("/held") }] });
    expect(bag.kernel[0].mount.absolute).toBe("/mode/game/board");
    expect(bag.kernel[0].url.absolute).toBe("http://x/daemon/d/mode/game/board");
    expect(bag.kernel[0].bundles.absolute).toBe("/m/d/bundles/game/board");
    expect(bag.kernel[1].mount.absolute).toBe("/held");
  });

  it("a slot naming an unsupplied package throws that package, not the whole bag silently", async () => {
    await expect(boot(MODULES).wire({ ...mask, lighthouse: { module: "@gone/lighthouse/x" } })).rejects.toThrow("package @gone not supplied");
  });
});

describe("registry.accio — a service mask", () => {
  const SERVICES = [
    { manifest: { owner: "@probe", type: "package", slug: "probe", version: "0.0.1" } },
    { manifest: { owner: "@probe", type: "service", slug: "attached", version: "0.0.1", traits: ["ATTACHED"] }, aperture: () => {} },
    { manifest: { owner: "@probe", type: "service", slug: "quiet", version: "0.0.1", traits: [] }, provider: () => ({}) },
  ];

  it("the declared manifest is the identity; the module's traits ride under it", async () => {
    const citizen = await boot(SERVICES).accio({ manifest: { type: "service", slug: "mine" }, module: "@probe/service/attached", mountpoint: new Path("/s") });
    expect(citizen.manifest.slug).toBe("mine");
    expect(citizen.manifest.traits).toEqual(["ATTACHED"]);
  });

  it("a settled mask carries traits: [] — the schematic's fill, not its word: the module's traits stay; a mask's own add, never strip", async () => {
    const filled = await boot(SERVICES).accio({ manifest: { type: "service", slug: "mine", traits: [] }, module: "@probe/service/attached", mountpoint: new Path("/s") });
    expect(filled.manifest.traits).toEqual(["ATTACHED"]);
    const added = await boot(SERVICES).accio({ manifest: { type: "service", slug: "mine", traits: ["STANDALONE"] }, module: "@probe/service/attached", mountpoint: new Path("/s") });
    expect(added.manifest.traits).toEqual(["ATTACHED", "STANDALONE"]);
  });

  it("a consumed-only service folds like any other — the runtime, not the registry, decides not to spawn it", async () => {
    const citizen = await boot(SERVICES).accio({ manifest: { type: "service", slug: "q" }, module: "@probe/service/quiet", mountpoint: new Path("/q") });
    expect(citizen.manifest.traits).toEqual([]);
    expect(citizen.aperture).toBeUndefined();
  });
});
