import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, v } from "@vivalence/typology";
import { Paladin } from "../paladin/prototype.js";
import { FULL } from "../gestalten/belt/index.js";
import { factories, lifecycle } from "../typology.js";

const HOME = new Path("/fixtures/probe");
const LEDGER = new Path("/fixtures/ledger");
const plain = (held) => JSON.parse(JSON.stringify(held));
const files = (ledger, instance) => async (path, fallback) =>
  String(path.absolute ?? path).endsWith("/ledger.viva.json") ? (ledger ? plain(ledger) : fallback) : plain(instance);

// ledger is a factory over the mount's paladin — its thunks must read the SAME bags the fold hydrates.
// any .viva.js at the root is the declaration: find.viva names it, read.module reads it
const mount = ({ ledger = () => null, instance }, pairs = {}) => {
  const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
  const module = ledger(paladin);
  paladin.scopes([
    ["ledger", () => true, () => LEDGER],
    ["instance", () => true, () => HOME],
    ["mountpoint", () => true, () => new Path("/mountpoint")],
  ]);
  for (const [key, value] of Object.entries(pairs)) paladin.env.set(key, value, "flag");
  paladin.secret.set("SECRET_VIVA_LEDGER_JWT", "a-signing-secret-of-twenty-four-or-more", "flag");
  paladin.read.json = files(module, { manifest: { type: "instance", slug: "probe", version: "0.0.1" }, ...instance });
  return factories.instance(lifecycle.paladin.instance(paladin));
};

// no manifest export — the file at the root is the declaration; type and slug derive
const ledger = (paladin, extra = {}) => ({
  runtime: { manifest: { slug: "runtime" }, statics: { serve: "${VIVA_LEDGER_SERVE}", remote: "http://ledger/" }, secrets: { jwt: "${SECRET_VIVA_LEDGER_JWT}" } },
  datamap: { module: "@commons/datamap/libsql" },
  hallucinators: [],
  clients: [{ manifest: { type: "client", slug: "anima" }, statics: { serve: "${VIVA_LEDGER_ANIMA}" } }],
  environment: v.environment({
    VIVA_LEDGER_SERVE: v.url().desc("ledger says"),
    VIVA_LEDGER_ANIMA: v.url().desc("ledger says"),
    VIVA_SHARED: v.string().desc("ledger's word"),
    SECRET_VIVA_LEDGER_JWT: v.string({ minLength: 24 }).desc("jwt"),
  }),
  ...extra,
});

const daemon = { manifest: { type: "daemon", slug: "probe", version: "0.0.1" }, modes: [] };

describe("ledger recipe — ledger → instance falls through by SLOT, environment by KEY, before a thunk fires", () => {
  it("no ledger module: nothing inherited, the instance is what it declares", async () => {
    const instance = await mount({ instance: { daemons: [daemon], datamap: { module: "@commons/datamap/libsql" } } });
    expect(instance.inherited).toEqual([]);
    expect(instance.runtime).toBeUndefined();
    expect(instance.clients).toEqual([]);
  });

  it("a declared slot is the instance's; an undeclared one is the ledger's; the runtime is the instance's own", async () => {
    const instance = await mount(
      {
        ledger: (paladin) => ledger(paladin),
        instance: { daemons: [daemon], runtime: { manifest: { slug: "own" }, statics: { serve: "http://own:1/", remote: "http://own:1/" }, secrets: { jwt: "${SECRET_VIVA_LEDGER_JWT}" } } },
      },
      { VIVA_LEDGER_ANIMA: "http://anima:1794/" },
    );
    expect(instance.runtime.manifest.slug).toBe("own");
    expect(instance.inherited).toEqual(["datamap", "hallucinators", "clients"]);
    expect(instance.clients[0].manifest.slug).toBe("anima");
    expect(instance.clients[0].statics.serve.href).toBe("http://anima:1794/");
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
      instance: { daemons: [daemon], runtime: { manifest: { slug: "own" }, statics: { serve: "http://own:1/", remote: "http://own:1/" }, secrets: { jwt: "${SECRET_VIVA_LEDGER_JWT}" } } },
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

  it("environment composes as an interface — an instance narrows a ledger key's default; a retyped key throws naming it", async () => {
    const narrowed = await mount({
      ledger: (paladin) => ledger(paladin),
      instance: { daemons: [daemon], environment: v.environment({ VIVA_LEDGER_SERVE: v.url().default("http://own:2502/").desc("own port") }) },
    });
    expect(narrowed.environment.properties.VIVA_LEDGER_SERVE.default).toBe("http://own:2502/");
    expect(narrowed.environment.properties.VIVA_SHARED.description).toBe("ledger's word");
    await expect(mount({
      ledger: (paladin) => ledger(paladin),
      instance: { daemons: [daemon], environment: v.environment({ VIVA_SHARED: v.integer().desc("retyped") }) },
    })).rejects.toThrow(/environment VIVA_SHARED retypes the ledger's key/);
  });

  it("the ledger is read ONCE per paladin — a second mount folds from the memo, find is not asked again", async () => {
    const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
    paladin.scopes([
      ["ledger", () => true, () => LEDGER],
      ["instance", () => true, () => HOME],
      ["mountpoint", () => true, () => new Path("/mountpoint")],
    ]);
    let asked = 0;
    const read = files(ledger(paladin), { manifest: { type: "instance", slug: "probe", version: "0.0.1" }, daemons: [daemon] });
    paladin.read.json = async (path, fallback) => (String(path.absolute).endsWith("/ledger.viva.json") && (asked += 1), read(path, fallback));
    const first = await factories.instance(lifecycle.paladin.instance(paladin));
    const second = await factories.instance(lifecycle.paladin.instance(paladin));
    expect(asked).toBe(1);
    expect(second.inherited).toEqual(first.inherited);
    expect(second.clients[0]).not.toBe(first.clients[0]); // hydrate walks a copy each mount — the memo holds the raw module, never a fired value
  });

  it("the manifest derives from the file's place — type ledger, slug from the stem — and an exported manifest LOCKS a field", async () => {
    const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
    paladin.scopes([["ledger", () => true, () => LEDGER]]);
    paladin.read.json = files(ledger(paladin));
    const derived = await paladin.ledger.recipe();
    expect(derived.manifest).toEqual({ type: "ledger", slug: "ledger" });
    expect(derived.source.absolute).toBe("/fixtures/ledger/ledger.viva.json");
    const locked = lifecycle.paladin.belt(new Paladin(), FULL);
    locked.scopes([["ledger", () => true, () => LEDGER]]);
    locked.read.json = files(ledger(locked, { manifest: { slug: "finns-other" } }));
    expect((await locked.ledger.recipe()).manifest).toEqual({ type: "ledger", slug: "finns-other" });
  });

  it("a manifest that says it is something else throws naming the file; a bad slug throws through the schematic", async () => {
    const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
    paladin.scopes([["ledger", () => true, () => LEDGER]]);
    paladin.read.json = files(ledger(paladin, { manifest: { type: "instance" } }));
    await expect(paladin.ledger.recipe()).rejects.toThrow(/ledger\.viva\.json declares manifest\.type "instance"/);
    const bad = lifecycle.paladin.belt(new Paladin(), FULL);
    bad.scopes([["ledger", () => true, () => LEDGER]]);
    bad.read.json = files(ledger(bad, { manifest: { slug: "Not A Slug" } }));
    await expect(bad.ledger.recipe()).rejects.toThrow(/ledger\.viva\.json manifest/);
  });
});
