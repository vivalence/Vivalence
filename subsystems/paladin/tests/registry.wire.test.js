import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, Url } from "@vivalence/typology";
import { Paladin } from "../paladin/prototype.js";
import { FULL } from "../gestalten/belt/index.js";
import { belt } from "../paladin/lifecycle.js";

// an in-memory pensieve: modules under @probe, no disk. accio and wire fold over what revelio hands back.
const boot = (modules) => {
  const paladin = belt(new Paladin(), FULL);
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

  it("a mode entry folds statics by key, the entry winning, and adds its traits; secrets and the mountpoint are the entry's; module and identifier ride along (m126 Q43 · Q44)", async () => {
    const registry = boot(MODULES);
    const citizen = await registry.accio({
      module: "@probe/game/board",
      traits: ["LOOPING"],
      statics: { size: 8 },
      secrets: { key: "k" },
      mountpoint: new Path("/mountpoint"),
    });
    expect(citizen.manifest).toMatchObject({ owner: "@probe", type: "game", slug: "board", traits: ["EXPOSED", "LOOPING"] });
    expect("traits" in citizen).toBe(false);
    expect(citizen.statics).toEqual({ theme: "wood", size: 8 });
    expect(citizen.secrets).toEqual({ key: "k" });
    expect(citizen.mountpoint.absolute).toBe("/mountpoint");
    expect(citizen.identifier).toBe("@probe/game/board");
    expect(citizen.module.manifest.slug).toBe("board");
    expect(typeof citizen.aperture).toBe("function");
  });

  it("a mask without statics or secrets still yields both keys — no ?? downstream", async () => {
    const registry = boot(MODULES);
    const citizen = await registry.accio({ module: "@probe/domain/chess" });
    expect(citizen.statics).toEqual({ depth: 3, seed: 1 });
    expect(citizen.secrets).toEqual({});
    expect("mountpoint" in citizen).toBe(false);
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
    datamap: { module: "@probe/datamap/map", statics: { db: { file: "d.viva.db" } } },
    hallucinators: [],
    consume: { light: { module: "@probe/lighthouse/light" } },
    modes: [{ module: "@probe/domain/chess", mountpoint: new Path("/m/chess") }, { module: "@probe/game/board", mountpoint: new Path("/m/board") }],
  };

  it("every slot is a citizen; the modes keeps its order; the domain is picked from it", async () => {
    const bag = await boot(MODULES).wire(mask);
    expect(bag.datamap.statics).toEqual({ db: { file: "d.viva.db" } });
    expect(bag.hallucinators).toEqual([]);
    expect(Object.keys(bag.consume)).toEqual(["light"]);
    expect(bag.modes.map((citizen) => citizen.manifest.slug)).toEqual(["chess", "board"]);
    expect(bag.domain.manifest.slug).toBe("chess");
  });

  it("a modes without a domain wires an empty domain, not a throw", async () => {
    const bag = await boot(MODULES).wire({ ...mask, modes: [mask.modes[1]] });
    expect(bag.domain.manifest?.slug).toBeUndefined();
    expect(bag.domain.traits).toEqual({ literal: [], symbol: [], note: [], mode: [] });
  });

  it("an entry that arrives unplaced is placed in wire from the folded manifest; a placed one is left alone", async () => {
    const placed = { ...mask, reference: new Path("/daemon/d"), url: new Url("http://x/daemon/d"), mountpoint: new Path("/m/d") };
    const bag = await boot(MODULES).wire({ ...placed, modes: [mask.modes[1], { ...mask.modes[0], reference: new Path("/held") }] });
    expect(bag.modes[0].reference.absolute).toBe("/mode/game/board");
    expect(bag.modes[0].url.absolute).toBe("http://x/daemon/d/mode/game/board");

    expect(bag.modes[1].reference.absolute).toBe("/held");
  });

  it("a mode wires its own mask — its consume each a citizen; its parent's bag leaves the entry's consume as authored", async () => {
    const consuming = { ...mask.modes[1], consume: { light: { module: "@probe/lighthouse/light", statics: { beam: 2 } } } };
    const registry = boot(MODULES);
    const bag = await registry.wire({ ...mask, modes: [consuming, mask.modes[0], "@probe/game/board"] });
    expect(bag.modes[0].consume).toEqual(consuming.consume);
    expect(typeof bag.consume.light.provider).toBe("function");
    const own = await registry.wire(consuming);
    expect(typeof own.consume.light.provider).toBe("function");
    expect(own.consume.light.statics).toEqual({ beam: 2 });
    expect(own.consume.light.identifier).toBe("@probe/lighthouse/light");
    expect((await registry.wire(mask.modes[0])).consume).toEqual({});
    expect(consuming.consume.light).toEqual({ module: "@probe/lighthouse/light", statics: { beam: 2 } });
    await expect(registry.wire({ ...mask.modes[1], consume: { x: { module: "@gone/service/x" } } })).rejects.toThrow("package @gone not supplied");
  });

  it("a hallucinator is a citizen carrying its mask's faculties, each stamped with its provider's slug (m126 Q7A)", async () => {
    const registry = boot([...MODULES, { manifest: { owner: "@probe", type: "hallucinator", slug: "voice", version: "0.0.1" }, provider: () => [] }]);
    const faculties = [{ type: "speech", id: "francesca", tier: "tongue" }];
    const bag = await registry.wire({ ...mask, hallucinators: [{ module: "@probe/hallucinator/voice", secrets: { key: "k" }, faculties }] });
    expect(typeof bag.hallucinators[0].provider).toBe("function");
    expect(bag.hallucinators[0].secrets).toEqual({ key: "k" });
    expect(bag.hallucinators[0].faculties).toEqual([{ type: "speech", id: "francesca", tier: "tongue", provider: "voice" }]);
    expect(faculties).toEqual([{ type: "speech", id: "francesca", tier: "tongue" }]);
  });

  it("a mode wearing HARNESS · CONVERSATION without the faculties it needs is REPORTED at its lookup path, never refused — its module's word or its entry's, the faculties its own folded list (m126 Q41)", async () => {
    const talker = { manifest: { owner: "@probe", type: "game", slug: "talker", version: "0.0.1", traits: ["HARNESS"] } };
    const registry = boot([...MODULES, talker]);
    const mute = { module: "@probe/game/talker", traits: ["CONVERSATION"], hallucinators: [] };
    const bag = await registry.wire({ ...mask, modes: [mute, { module: "@probe/game/board", traits: [], hallucinators: [] }] });
    expect(bag.modes.map((citizen) => citizen.manifest.traits)).toEqual([["HARNESS", "CONVERSATION"], ["EXPOSED"]]);
    expect(bag.dormant).toEqual([
      { at: "daemons.d.modes.game.talker", module: "@probe/game/talker", empty: [], why: "HARNESS — no dialogue among its faculties" },
      { at: "daemons.d.modes.game.talker", module: "@probe/game/talker", empty: [], why: "CONVERSATION — no call, nor verbatim + dialogue + speech among its faculties" },
    ]);

    const voiced = boot([...MODULES, talker]);
    const faculties = (...types) => [{ module: "@probe/hallucinator/any", faculties: types.map((type) => ({ type, id: type })) }];
    const runtime = { ...mask, manifest: { type: "runtime", slug: "runtime" } };
    expect((await voiced.wire({ ...runtime, modes: [{ ...mute, hallucinators: faculties("dialogue", "call") }] })).dormant).toEqual([]);
    expect((await voiced.wire({ ...runtime, modes: [{ ...mute, hallucinators: faculties("dialogue", "verbatim") }] })).dormant).toEqual([
      { at: "runtime.modes.game.talker", module: "@probe/game/talker", empty: [], why: "CONVERSATION — no call, nor verbatim + dialogue + speech among its faculties" },
    ]);
  });

  it("trait config for a trait the mode does not wear refuses the bag, the stray word named; worn, it rides the citizen as written (m126 Q40)", async () => {
    const registry = boot(MODULES);
    const entry = { module: "@probe/game/board", traits: [], trait: { HARNESSED: { tier: "fast" } }, hallucinators: [] };
    await expect(registry.wire({ ...mask, modes: [entry] })).rejects.toThrow("[registry] game/board: trait HARNESSED configured, HARNESS not among its traits EXPOSED");
    const bag = await registry.wire({ ...mask, modes: [{ ...entry, traits: ["HARNESS"] }] });
    expect(bag.modes[0].manifest.traits).toEqual(["EXPOSED", "HARNESS"]);
    expect(bag.modes[0].trait).toEqual(entry.trait);
  });

  it("a slot naming an unsupplied package throws that package, not the whole bag silently", async () => {
    await expect(boot(MODULES).wire({ ...mask, datamap: { module: "@gone/datamap/x" } })).rejects.toThrow("package @gone not supplied");
  });
});

describe("registry.accio — a service mask", () => {
  const SERVICES = [
    { manifest: { owner: "@probe", type: "package", slug: "probe", version: "0.0.1" } },
    { manifest: { owner: "@probe", type: "service", slug: "attached", version: "0.0.1", traits: ["ATTACHED"] }, attachment: () => {} },
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
    const added = await boot(SERVICES).accio({ manifest: { type: "service", slug: "mine", traits: ["CONVERSATION"] }, module: "@probe/service/attached", mountpoint: new Path("/s") });
    expect(added.manifest.traits).toEqual(["ATTACHED", "CONVERSATION"]);
  });

  it("a consumed-only service folds like any other — the runtime, not the registry, decides not to spawn it", async () => {
    const citizen = await boot(SERVICES).accio({ manifest: { type: "service", slug: "q" }, module: "@probe/service/quiet", mountpoint: new Path("/q") });
    expect(citizen.manifest.traits).toEqual([]);
    expect(citizen.aperture).toBeUndefined();
  });
});
