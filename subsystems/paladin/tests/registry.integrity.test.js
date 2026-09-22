import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, Span } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";
import { probe, RULES } from "../prototypes/ledger/integrity.js";

const span = () => new Span({ nature: "/probe" });
const said = (held, verb) => held.records.filter((record) => record.verb === verb).map((record) => record.data?.message ?? record.data);

describe("integrity — the fold over pairs", () => {
  it("a domain validates against Domain; today its entities default, so a bare domain passes (the sentence arrives with typology's line)", () => {
    const held = span();
    const probed = probe(RULES)({ manifest: { type: "domain", slug: "bare", version: "0.0.1", traits: [] } }, held);
    expect(probed.manifest.slug).toBe("bare");
    expect(said(held, "fault")).toEqual([]);
    const wrong = span();
    probe(RULES)({ manifest: { type: "domain", slug: "bad", version: "0.0.1", traits: [] }, entities: "not a record" }, wrong);
    expect(said(wrong, "fault").some((sentence) => sentence.startsWith("/entities "))).toBe(true);
  });

  it("a trait names the export it travels with — missing is a fault, present is silence", () => {
    const held = span();
    probe(RULES)({ manifest: { type: "game", slug: "g", version: "0.0.1", traits: ["EXPOSED", "BOOTED"] }, aperture: () => {} }, held);
    expect(said(held, "fault")).toEqual(["BOOTED: no boot export"]);
  });

  it("a marker trait carries nothing and asks nothing", () => {
    const held = span();
    probe(RULES)({ manifest: { type: "game", slug: "g", version: "0.0.1", traits: ["STANDALONE", "CONVERSATIONAL"] } }, held);
    expect(said(held, "fault")).toEqual([]);
  });

  it("a manifest the schematic refuses is a fault, not a throw — only a missing slug throws", () => {
    const held = span();
    probe(RULES)({ manifest: { type: 42, slug: "g", version: "0.0.1", traits: [] } }, held);
    expect(said(held, "fault").some((sentence) => sentence.startsWith("/type "))).toBe(true);
    expect(() => probe(RULES)({ manifest: { type: "game" } }, span())).toThrow("unfit to register");
  });

  it("order is authored order: a rule that rewrites the module is read by the rule after it", () => {
    const held = span();
    const rules = [
      [() => true, (module, s) => (s.note("first"), { ...module, manifest: { ...module.manifest, traits: ["EXPOSED"] } })],
      [(module) => module.manifest.traits.includes("EXPOSED"), (module, s) => (s.note("second"), module)],
    ];
    probe(rules)({ manifest: { type: "game", slug: "g", traits: [] } }, held);
    expect(said(held, "note")).toEqual(["first", "second"]);
  });
});

// the registry side: mount probes on the copy, a throw faults under the file's path and the walk continues,
// every road out passes assert(), a mask-added trait throws on the entry and leaves the module resolvable.
const author = async (dir, files) => {
  await Deno.mkdir(dir, { recursive: true });
  for (const [name, text] of Object.entries(files)) await Deno.writeTextFile(`${dir}/${name}`, text);
};

const boot = (store) => {
  const paladin = new Paladin();
  paladin.scopes([
    ["ledger", () => true, () => new Path(store)],
    ["registry", () => true, () => new Path(store)],
  ]);
  return paladin.ledger.registry;
};

const PACK = `export const manifest = { owner: "@pack", type: "package", slug: "pack", version: "0.0.1" };`;

describe("registry — integrity at mount and at accio", () => {
  it("mount: a faulted module registers and is listed; a slugless file faults under its own path; siblings register", async () => {
    const store = await Deno.makeTempDir({ prefix: "integrity_" });
    await author(`${store}/pack`, {
      "pack.viva.js": PACK,
      "bare.viva.js": `export const manifest = { type: "domain", slug: "bare", version: "0.0.1", traits: ["EXPOSED"] };`,
      "fine.viva.js": `export const manifest = { type: "game", slug: "fine", version: "0.0.1", traits: ["EXPOSED"] }; export const aperture = () => {};`,
      "nameless.viva.js": `export const manifest = { type: "game", version: "0.0.1" };`,
    });
    const registry = boot(store);
    await registry.mount(new Path(`${store}/pack`));
    expect((await registry.list({ type: "game" })).map((module) => module.manifest.slug)).toEqual(["fine"]);
    expect((await registry.list({ type: "domain" })).map((module) => module.manifest.slug)).toEqual(["bare"]);
    const faulted = [...registry.integrity.keys()];
    expect(faulted.some((path) => path.endsWith("/bare.viva.js"))).toBe(true);
    expect(faulted.some((path) => path.endsWith("/nameless.viva.js"))).toBe(true);
  });

  it("accio of a faulted module throws its sentences; a clean sibling resolves", async () => {
    const store = await Deno.makeTempDir({ prefix: "integrity_" });
    await author(`${store}/pack`, {
      "pack.viva.js": PACK,
      "bare.viva.js": `export const manifest = { type: "domain", slug: "bare", version: "0.0.1", traits: ["EXPOSED"] };`,
      "fine.viva.js": `export const manifest = { type: "game", slug: "fine", version: "0.0.1" };`,
    });
    const registry = boot(store);
    await registry.mount(new Path(`${store}/pack`));
    await expect(registry.accio({ module: "@pack/domain/bare" })).rejects.toThrow("/bare.viva.js: EXPOSED: no aperture export");
    await expect(registry.accio("@pack/domain/bare")).rejects.toThrow("EXPOSED: no aperture export");
    expect((await registry.accio("@pack/game/fine")).manifest.slug).toBe("fine");
  });

  it("a trait the MASK adds throws on the entry — the module itself still resolves", async () => {
    const store = await Deno.makeTempDir({ prefix: "integrity_" });
    await author(`${store}/pack`, {
      "pack.viva.js": PACK,
      "fine.viva.js": `export const manifest = { type: "game", slug: "fine", version: "0.0.1" };`,
    });
    const registry = boot(store);
    await registry.mount(new Path(`${store}/pack`));
    await expect(registry.accio({ module: "@pack/game/fine", manifest: { traits: ["BOOTED"] } })).rejects.toThrow("/entry/game/fine: BOOTED: no boot export");
    expect((await registry.accio("@pack/game/fine")).manifest.slug).toBe("fine");
  });

  it("a manifest-less file under ledger/ registers as ledger/<name>: its manifest derives from its place; its own word overwrites", async () => {
    const store = await Deno.makeTempDir({ prefix: "integrity_" });
    await author(`${store}/pack`, { "pack.viva.js": PACK });
    await author(`${store}/pack/ledger`, { "ledger.viva.js": `export const runtime = {};`, "named.viva.js": `export const manifest = { slug: "mine" };` });
    const registry = boot(store);
    await registry.mount(new Path(`${store}/pack`));
    expect((await registry.accio("@pack/ledger/ledger")).manifest.type).toBe("ledger");
    expect((await registry.accio("@pack/ledger/mine")).manifest.slug).toBe("mine");
    expect(registry.integrity.size).toBe(0);
  });

  it("the index outlives the journal cap: 1 200 modules, one fault each, every one in the map", async () => {
    const store = await Deno.makeTempDir({ prefix: "integrity_" });
    const files = { "pack.viva.js": PACK };
    for (let i = 0; i < 1200; i++) files[`m${i}.viva.js`] = `export const manifest = { type: "game", slug: "m${i}", version: "0.0.1", traits: ["EXPOSED"] };`;
    await author(`${store}/pack`, files);
    const registry = boot(store);
    await registry.mount(new Path(`${store}/pack`));
    expect(registry.integrity.size).toBe(1200);
    expect(registry.span.records.length).toBeLessThan(registry.integrity.size);
  });
});
