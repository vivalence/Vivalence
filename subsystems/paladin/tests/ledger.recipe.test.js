import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, v } from "@vivalence/typology";
import { Paladin } from "../paladin/prototype.js";
import { FULL } from "../gestalten/belt/index.js";
import { factories, lifecycle } from "../typology.js";
import { extend } from "../gestalten/belt/faculties.js";

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
  paladin.find.recipe = (home) => home.branch("instance.viva.json");
  paladin.read.json = files(module, { manifest: { type: "instance", slug: "probe", version: "0.0.1" }, ...instance });
  lifecycle.paladin.instance(paladin);
  return factories.instance(paladin).then((instance) => Object.assign(instance, { check: paladin.check }));
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
    expect(instance.paladin.inherited).toEqual([]);
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
    expect(instance.paladin.inherited).toEqual(["datamap", "clients"]);
    expect(instance.clients[0].manifest.slug).toBe("anima");
    expect(instance.clients[0].statics.serve.href).toBe("http://anima:1794/");
    expect(instance.paladin.faults).toEqual([]);
  });

  it("a declared [] is 'none' — the ledger's list does not merge in", async () => {
    const instance = await mount({ ledger: (paladin) => ledger(paladin), instance: { daemons: [daemon], clients: [] } });
    expect(instance.clients).toEqual([]);
    expect(instance.paladin.inherited).not.toContain("clients");
  });

  it("telemetry falls through whole like any slot; the instance's own wins; a wrong one is named", async () => {
    const telemetry = { logger: { "daemons/:daemon.jsonl": { "/runtime/runtime/daemon/:daemon/(.*)": ["fault"] } } };
    const fallen = await mount({ ledger: (paladin) => ledger(paladin, { telemetry }), instance: { daemons: [daemon] } });
    expect(fallen.paladin.inherited).toContain("telemetry");
    expect(fallen.telemetry).toEqual(telemetry);
    const own = await mount({
      ledger: (paladin) => ledger(paladin, { telemetry }),
      instance: { daemons: [daemon], telemetry: { logger: {} } },
    });
    expect(own.telemetry).toEqual({ logger: {} });
    const wrong = { logger: { stdout: { "/(.*)": ["status"] } } };
    const refused = await mount({ ledger: (paladin) => ledger(paladin, { telemetry: wrong }), instance: { daemons: [daemon] } });
    expect(refused.paladin.faults).toContain('telemetry.logger.stdout is neither "console" nor "socket" nor a .jsonl path');
  });

  it("the ledger's thunks fire ONCE, at the instance's own label (clients.anima), and an overridden slot's thunk never fires", async () => {
    const instance = await mount({
      ledger: (paladin) => ledger(paladin),
      instance: { daemons: [daemon], runtime: { manifest: { slug: "own" }, statics: { serve: "http://own:1/", remote: "http://own:1/" }, secrets: { jwt: "${SECRET_VIVA_LEDGER_JWT}" } } },
    });
    const sites = instance.paladin.requirements.map((row) => row.at);
    expect(sites).toContain("clients.anima.statics.serve");
    expect(sites).not.toContain("runtime.statics.serve");
    expect(sites.filter((at) => at === "clients.anima.statics.serve")).toHaveLength(1);
  });

  it("environment folds by KEY — the ledger's keys are documented, the instance's key wins a collision", async () => {
    const instance = await mount({
      ledger: (paladin) => ledger(paladin),
      instance: { daemons: [daemon], environment: v.environment({ VIVA_SHARED: v.string().desc("instance's word"), VIVA_OWN: v.string().desc("own") }) },
    });
    const keys = Object.keys(instance.environment.properties);
    expect(keys).toEqual(expect.arrayContaining(["VIVA_LEDGER_SERVE", "VIVA_LEDGER_ANIMA", "VIVA_SHARED", "VIVA_OWN"]));
    expect(instance.environment.properties.VIVA_SHARED.description).toBe("instance's word");
    const rows = instance.check.environment(instance);
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
    paladin.find.recipe = (home) => home.branch("instance.viva.json");
    paladin.read.json = async (path, fallback) => (String(path.absolute).endsWith("/ledger.viva.json") && (asked += 1), read(path, fallback));
    lifecycle.paladin.instance(paladin);
    const first = await factories.instance(paladin);
    lifecycle.paladin.instance(paladin);
    const second = await factories.instance(paladin);
    expect(asked).toBe(1);
    expect(second.paladin.inherited).toEqual(first.paladin.inherited);
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

describe("faculty unfolding — extend(below, above), the one fold every level runs; ledger → runtime in the recipe beat (m126 Q2)", () => {
  const voice = { module: "@commons/hallucinator/elevenlabs", secrets: { key: "above" }, faculties: [{ type: "speech", id: "leandro", tune: [0.3, 0.9, 0.5], tier: "tongue" }, { type: "verbatim", id: "scribe", tune: [0.3, 1.0, 0.5] }] };
  const mind = { module: "@commons/hallucinator/openrouter", secrets: { key: "above" }, faculties: [{ type: "dialogue", id: "oss-groq", model: "llama", tune: [0.4, 1.0, 0.8] }] };

  it("nothing below: the level holds what is above, the same masks", () => {
    expect(extend([], [voice, mind])).toEqual([voice, mind]);
  });

  it("a provider named below joins by module — it keeps the key above and adds its faculty; an untagged faculty above is kept", () => {
    const [held] = extend([{ module: voice.module, faculties: [{ type: "speech", id: "luiza", tune: [0.3, 0.8, 0.5] }] }], [voice]);
    expect(held.secrets).toEqual({ key: "above" });
    expect(held.faculties.map((faculty) => faculty.id)).toEqual(["leandro", "scribe", "luiza"]);
  });

  it("a restated id is ONE faculty: its keys above, the keys below over them", () => {
    const [, held] = extend([{ module: mind.module, faculties: [{ id: "oss-groq", tier: "actor" }] }], [voice, mind]);
    expect(held.faculties).toEqual([{ type: "dialogue", id: "oss-groq", model: "llama", tune: [0.4, 1.0, 0.8], tier: "actor" }]);
  });

  it("a tier worn below is unique in the set: the faculty wearing it above leaves, under any provider", () => {
    const francesca = { type: "speech", id: "francesca", tune: [0.3, 0.9, 0.5], tier: "tongue" };
    const [held, own] = extend([{ module: "@commons/hallucinator/deepgram", secrets: { key: "below" }, faculties: [francesca] }], [voice]);
    expect(held.faculties.map((faculty) => faculty.id)).toEqual(["scribe"]);
    expect(own).toEqual({ module: "@commons/hallucinator/deepgram", secrets: { key: "below" }, faculties: [francesca] });
  });

  it("a provider only below is added whole, after those above", () => {
    expect(extend([mind], [voice]).map((mask) => mask.module)).toEqual([voice.module, mind.module]);
  });

  it("source is not mutated", () => {
    const below = [{ module: mind.module, faculties: [{ id: "oss-groq", tier: "actor" }] }, { module: voice.module, faculties: [{ type: "speech", id: "francesca", tier: "tongue" }] }];
    const above = [voice, mind];
    const before = plain({ below, above });
    extend(below, above);
    expect(plain({ below, above })).toEqual(before);
  });

  it("the ledger's hallucinators are the runtime's — an inherited runtime holds them, a declared one adds to them; the root holds none", async () => {
    const supplied = (paladin) => ledger(paladin, { hallucinators: [{ ...mind, secrets: { key: "${SECRET_VIVA_LEDGER_JWT}" } }] });
    const inherited = await mount({ ledger: supplied, instance: { daemons: [daemon] } }, { VIVA_LEDGER_ANIMA: "http://anima:1794/", VIVA_LEDGER_SERVE: "http://ledger:1/" });
    expect(inherited.paladin.faults).toEqual([]);
    expect(inherited.hallucinators).toBeUndefined();
    expect(inherited.runtime.hallucinators.map((mask) => mask.faculties.map((faculty) => faculty.id))).toEqual([["oss-groq"]]);
    expect(inherited.daemons[0].hallucinators).toEqual(inherited.runtime.hallucinators);
    const own = { manifest: { slug: "own" }, statics: { serve: "http://own:1/", remote: "http://own:1/" }, secrets: { jwt: "${SECRET_VIVA_LEDGER_JWT}" }, hallucinators: [{ ...voice, secrets: { key: "${SECRET_VIVA_LEDGER_JWT}" } }] };
    const declared = await mount({ ledger: supplied, instance: { daemons: [daemon], runtime: own } }, { VIVA_LEDGER_ANIMA: "http://anima:1794/" });
    expect(declared.paladin.faults).toEqual([]);
    expect(declared.runtime.hallucinators.map((mask) => mask.module)).toEqual([mind.module, voice.module]);
  });
});
