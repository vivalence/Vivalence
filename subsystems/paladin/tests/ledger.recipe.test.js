import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, v } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";
import * as lifecycle from "../lifecycle/index.js";

const HOME = new Path("/fixtures/probe/test.viva.js");
const LEDGER = new Path("/fixtures/ledger");
const FILE = LEDGER.branch("viva.viva.js");

// ledger is a factory over the mount's paladin — its thunks must read the SAME bags the fold hydrates.
// any .viva.js at the root is the declaration: find.viva names it, read.module reads it
const mount = ({ ledger = () => null, instance }, pairs = {}) => {
  const paladin = new Paladin();
  const module = ledger(paladin);
  paladin.scopes([
    ["ledger", () => true, () => LEDGER],
    ["instance", () => true, () => HOME],
    ["mountpoint", () => true, () => new Path("/mountpoint")],
  ]);
  for (const [key, value] of Object.entries(pairs)) paladin.env.set(key, value, "flag");
  paladin.find.viva = async () => (module ? [FILE] : []);
  paladin.read.module = async () => module;
  paladin.find.type = async () => [{ manifest: { type: "instance", slug: "probe", version: "0.0.1" }, source: HOME, ...instance }];
  return lifecycle.mount(lifecycle.populate.instance(paladin));
};

// no manifest export — the file at the root is the declaration; type and slug derive
const ledger = (paladin, extra = {}) => ({
  runtime: { manifest: { slug: "runtime" }, statics: { serve: () => paladin.env.get("VIVA_LEDGER_SERVE"), remote: "http://ledger/" } },
  lighthouse: { module: "@commons/lighthouse/multiplayer", statics: { remote: "http://ledger/lighthouse" } },
  datamap: { module: "@commons/datamap/libsql" },
  hallucinators: [],
  clients: [{ manifest: { type: "client", slug: "anima" }, statics: { serve: () => paladin.env.get("VIVA_LEDGER_ANIMA") } }],
  environment: v.environment({
    VIVA_LEDGER_SERVE: v.url().desc("ledger says"),
    VIVA_LEDGER_ANIMA: v.url().desc("ledger says"),
    VIVA_SHARED: v.string().desc("ledger's word"),
  }),
  ...extra,
});

const daemon = { manifest: { type: "daemon", slug: "probe", version: "0.0.1" }, kernel: [] };

describe("ledger recipe — ledger → instance falls through by SLOT, environment by KEY, before a thunk fires", () => {
  it("no ledger module: nothing inherited, the instance is what it declares", async () => {
    const instance = await mount({ instance: { daemons: [daemon], lighthouse: { module: "@commons/lighthouse/multiplayer", statics: { remote: "http://own/" } }, datamap: { module: "@commons/datamap/libsql" } } });
    expect(instance.inherited).toEqual([]);
    expect(instance.runtime).toBeUndefined();
    expect(instance.clients).toEqual([]);
  });

  it("a declared slot is the instance's; an undeclared one is the ledger's; a daemon takes the ledger's lighthouse through the instance", async () => {
    const instance = await mount(
      {
        ledger: (paladin) => ledger(paladin),
        instance: { daemons: [daemon], runtime: { manifest: { slug: "own" }, statics: { serve: "http://own:1/", remote: "http://own:1/" } } },
      },
      { VIVA_LEDGER_ANIMA: "http://anima:1794/" },
    );
    expect(instance.runtime.manifest.slug).toBe("own");
    expect(instance.inherited).toEqual(["lighthouse", "datamap", "hallucinators", "clients"]);
    expect(instance.clients[0].manifest.slug).toBe("anima");
    expect(instance.clients[0].statics.serve.href).toBe("http://anima:1794/");
    expect(instance.daemons[0].lighthouse.statics.remote.href).toBe("http://ledger/lighthouse");
    expect(instance.faults).toEqual([]);
  });

  it("a declared [] is 'none' — the ledger's list does not merge in", async () => {
    const instance = await mount({ ledger: (paladin) => ledger(paladin), instance: { daemons: [daemon], clients: [] } });
    expect(instance.clients).toEqual([]);
    expect(instance.inherited).not.toContain("clients");
  });

  it("the ledger's thunks fire ONCE, at the instance's own label (client[anima]), and an overridden slot's thunk never fires", async () => {
    const instance = await mount({
      ledger: (paladin) => ledger(paladin),
      instance: { daemons: [daemon], runtime: { manifest: { slug: "own" }, statics: { serve: "http://own:1/", remote: "http://own:1/" } } },
    });
    const sites = instance.requirements.map((row) => row.at);
    expect(sites).toContain("client[anima].statics.serve");
    expect(sites).not.toContain("runtime.statics.serve");
    expect(sites.filter((at) => at === "client[anima].statics.serve")).toHaveLength(1);
  });

  it("environment folds by KEY — the ledger's keys are documented, the instance's key wins a collision", async () => {
    const instance = await mount({
      ledger: (paladin) => ledger(paladin),
      instance: { daemons: [daemon], environment: v.environment({ VIVA_SHARED: v.string().desc("instance's word"), VIVA_OWN: v.string().desc("own") }) },
    });
    const keys = Object.keys(instance.environment.properties);
    expect(keys).toEqual(expect.arrayContaining(["VIVA_LEDGER_SERVE", "VIVA_LEDGER_ANIMA", "VIVA_SHARED", "VIVA_OWN"]));
    expect(instance.environment.properties.VIVA_SHARED.description).toBe("instance's word");
    const rows = instance.paladin.check.environment(instance);
    expect(rows.find((row) => row.key === "VIVA_LEDGER_ANIMA")?.verdict).toBe("REQUIRED");
  });

  it("the ledger is read ONCE per paladin — a second mount folds from the memo, find is not asked again", async () => {
    const paladin = new Paladin();
    paladin.scopes([
      ["ledger", () => true, () => LEDGER],
      ["instance", () => true, () => HOME],
      ["mountpoint", () => true, () => new Path("/mountpoint")],
    ]);
    let asked = 0;
    paladin.find.viva = async () => [FILE];
    paladin.read.module = async () => (asked += 1, ledger(paladin));
    paladin.find.type = async () => [{ manifest: { type: "instance", slug: "probe", version: "0.0.1" }, source: HOME, daemons: [daemon] }];
    const first = await lifecycle.mount(lifecycle.populate.instance(paladin));
    const second = await lifecycle.mount(lifecycle.populate.instance(paladin));
    expect(asked).toBe(1);
    expect(second.inherited).toEqual(first.inherited);
    expect(second.clients[0]).not.toBe(first.clients[0]); // hydrate walks a copy each mount — the memo holds the raw module, never a fired value
  });

  it("the manifest derives from the file's place — type ledger, slug from the stem — and an exported manifest LOCKS a field", async () => {
    const paladin = new Paladin();
    paladin.scopes([["ledger", () => true, () => LEDGER]]);
    paladin.find.viva = async () => [FILE];
    paladin.read.module = async () => ledger(paladin);
    const derived = await paladin.ledger.recipe();
    expect(derived.manifest).toEqual({ type: "ledger", slug: "viva" });
    expect(derived.source.absolute).toBe("/fixtures/ledger/viva.viva.js");
    const locked = new Paladin();
    locked.scopes([["ledger", () => true, () => LEDGER]]);
    locked.find.viva = async () => [FILE];
    locked.read.module = async () => ledger(locked, { manifest: { slug: "finns-other" } });
    expect((await locked.ledger.recipe()).manifest).toEqual({ type: "ledger", slug: "finns-other" });
  });

  it("a manifest that says it is something else throws naming the file; a bad slug throws through the schematic", async () => {
    const paladin = new Paladin();
    paladin.scopes([["ledger", () => true, () => LEDGER]]);
    paladin.find.viva = async () => [FILE];
    paladin.read.module = async () => ledger(paladin, { manifest: { type: "instance" } });
    await expect(paladin.ledger.recipe()).rejects.toThrow(/viva\.viva\.js declares manifest\.type "instance"/);
    const bad = new Paladin();
    bad.scopes([["ledger", () => true, () => LEDGER]]);
    bad.find.viva = async () => [FILE];
    bad.read.module = async () => ledger(bad, { manifest: { slug: "Not A Slug" } });
    await expect(bad.ledger.recipe()).rejects.toThrow(/viva\.viva\.js manifest/);
    const two = new Paladin();
    two.scopes([["ledger", () => true, () => LEDGER]]);
    two.find.viva = async () => [FILE, LEDGER.branch("other.viva.js")];
    await expect(two.ledger.recipe()).rejects.toThrow(/one declaration per ledger — .* holds viva\.viva\.js, other\.viva\.js/);
  });
});
