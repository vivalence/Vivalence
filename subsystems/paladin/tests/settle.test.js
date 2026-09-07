import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Env, Path, Url, v } from "@vivalence/typology";
import { Instance } from "../prototypes/instance.js";
import check from "../belt/check.js";

const HOME = new Path("/fixtures/probe/test.viva.js");
const STRATA = ["flag", "cwd", "instance", ".env", "os", "session", "ledger"];

// declare(paladin) → the recipe's exports; the thunks inside close over THIS paladin's bags.
const mount = (declare, pairs = {}, secrets = {}) => {
  const paladin = {
    env: new Env(STRATA),
    secret: new Env(STRATA),
    scope: { instance: HOME, mountpoint: new Path("/mountpoint") },
    state: { dir: async () => {} },
    publish: () => {},
  };
  check(paladin);
  for (const [key, value] of Object.entries(pairs)) paladin.env.set(key, value, "flag");
  for (const [key, value] of Object.entries(secrets)) paladin.secret.set(key, value, "flag");
  const module = { manifest: { type: "instance", slug: "probe", version: "0.0.1" }, source: HOME, ...declare(paladin) };
  paladin.find = { type: async () => [module] };
  return new Instance(paladin).mount();
};

const runtime = (paladin) => ({ slug: "runtime", statics: { serve: () => paladin.env.get("VIVA_PROBE_SERVE") } });
const lighthouse = (paladin) => ({
  module: "@commons/lighthouse/multiplayer",
  statics: { remote: () => paladin.env.get("VIVA_PROBE_REMOTE") },
});
const daemon = (extra = {}) => ({
  manifest: { type: "daemon", slug: "probe", version: "0.0.1" },
  datamap: { module: "@commons/datamap/libsql" },
  ...extra,
});
const anthropic = (paladin) => ({
  module: "@commons/hallucinator/anthropic",
  secrets: { key: () => paladin.secret.get("SECRET_VIVA_PROBE_A") },
});
const deepgram = (paladin) => ({
  module: "@commons/hallucinator/deepgram",
  secrets: { key: () => paladin.secret.get("SECRET_VIVA_PROBE_D") },
});
const stanza = (paladin) => ({
  module: "@commons/service/nlp-stanza",
  secrets: { key: () => paladin.secret.get("SECRET_VIVA_PROBE_D") },
  statics: { remote: () => paladin.env.get("VIVA_PROBE_REMOTE") },
});

const environment = v.environment({
  VIVA_PROBE_SERVE: v.url().desc("serve"),
  VIVA_PROBE_REMOTE: v.url().desc("remote"),
  SECRET_VIVA_PROBE_A: v.string().desc("a"),
  SECRET_VIVA_PROBE_D: v.string().desc("d").optional(),
});

const SET = { VIVA_PROBE_SERVE: "http://localhost:2501/", VIVA_PROBE_REMOTE: "http://localhost:2501/lighthouse" };
const verdict = (instance) => instance.paladin.check.instance(instance);
const sentences = (instance) => verdict(instance).map((issue) => issue.message);

describe("settle — the schematic fills, mints and judges what the pinhole fired", () => {
  it("a typed static decodes to its prototype: serve arrives as a Url, the recipe handed a string", async () => {
    const instance = await mount((paladin) => ({ runtime: runtime(paladin), environment }), SET);
    expect(instance.runtime.statics.serve).toBeInstanceOf(Url);
    expect(instance.runtime.statics.serve.port).toBe("2501");
    expect(instance.faults).toEqual([]);
  });

  it("a blank address is a fault, never a throw — the doctor mounts a bare recipe", async () => {
    const instance = await mount((paladin) => ({ runtime: runtime(paladin), environment }));
    expect(instance.faults).toEqual(["runtime.statics.serve must be RFC 3986 URI with an authority (scheme://…)"]);
    expect(instance.runtime.statics.serve).not.toBeInstanceOf(Url);
    expect(verdict(instance).fails).toBe(true);
    expect(sentences(instance)).toEqual(["SECRET_VIVA_PROBE_A REQUIRED", "VIVA_PROBE_REMOTE REQUIRED", "VIVA_PROBE_SERVE REQUIRED at runtime.statics.serve"]);
  });

  it("statics, consume and hallucinators need not be authored — the schematic fills them", async () => {
    const instance = await mount((paladin) => ({ lighthouse: lighthouse(paladin), daemons: [daemon()], environment }), SET);
    const [held] = instance.daemons;
    expect(held.statics).toEqual({});
    expect(held.consume).toEqual({});
    expect(held.hallucinators).toEqual([]);
    expect(held.kernel).toEqual([]);
    expect(instance.faults).toEqual([]);
  });

  it("a hallucinator whose secret is blank is dormant: off the roster, named on the instance, still in the record", async () => {
    const instance = await mount(
      (paladin) => ({
        lighthouse: lighthouse(paladin),
        daemons: [daemon({ hallucinators: [anthropic(paladin), deepgram(paladin)] })],
        environment,
      }),
      SET,
      { SECRET_VIVA_PROBE_A: "canary" },
    );
    const [held] = instance.daemons;
    expect(held.hallucinators.map((mask) => mask.module)).toEqual(["@commons/hallucinator/anthropic"]);
    expect(held.hallucinators[0].secrets.key).toBe("canary");
    expect(instance.dormant).toEqual(["daemon[probe].hallucinators[1]"]);
    expect(instance.requirements.map((row) => row.at)).toContain("daemon[probe].hallucinators[1].secrets.key");
    expect(instance.faults).toEqual([]);
  });

  it("a consumed service whose secret is blank is dormant: off the daemon, named on the instance", async () => {
    const instance = await mount(
      (paladin) => ({
        lighthouse: lighthouse(paladin),
        daemons: [daemon({ hallucinators: [anthropic(paladin)], consume: { nlp: stanza(paladin) } })],
        environment,
      }),
      SET,
      { SECRET_VIVA_PROBE_A: "canary" },
    );
    const [held] = instance.daemons;
    expect(held.consume).toEqual({});
    expect(instance.dormant).toEqual(["daemon[probe].consume.nlp"]);
    expect(instance.faults).toEqual([]);
  });

  it("bootable = no fault and no wrong env row; a required blank refuses, an optional blank does not", async () => {
    const declare = (paladin) => ({
      runtime: runtime(paladin),
      lighthouse: lighthouse(paladin),
      daemons: [daemon({ hallucinators: [anthropic(paladin), deepgram(paladin)] })],
      environment,
    });
    const full = await mount(declare, SET, { SECRET_VIVA_PROBE_A: "a", SECRET_VIVA_PROBE_D: "d" });
    expect(verdict(full).fails).toBe(false);
    expect(full.dormant).toEqual([]);

    const optional = await mount(declare, SET, { SECRET_VIVA_PROBE_A: "a" });
    expect(verdict(optional).fails).toBe(false);
    expect(optional.dormant).toEqual(["daemon[probe].hallucinators[1]"]);

    const refused = await mount(declare, SET, { SECRET_VIVA_PROBE_D: "d" });
    expect(verdict(refused).fails).toBe(true);
    expect(refused.dormant).toEqual(["daemon[probe].hallucinators[0]"]);
    expect(sentences(refused)).toEqual(["SECRET_VIVA_PROBE_A REQUIRED at daemon[probe].hallucinators[0].secrets.key"]);
  });

  it("inheritance happens after settle: a daemon's inherited lighthouse IS the instance's decoded object", async () => {
    const instance = await mount((paladin) => ({ lighthouse: lighthouse(paladin), daemons: [daemon()], environment }), SET);
    const [held] = instance.daemons;
    expect(held.lighthouse).toBe(instance.lighthouse);
    expect(held.lighthouse.statics.remote).toBeInstanceOf(Url);
    expect(held.lighthouse.statics.remote.absolute).toBe("http://localhost:2501/lighthouse");
  });

  it("a faulted slot stays as hydrated — decode never runs on a value the schematic refused; one sentence per location", async () => {
    const instance = await mount((paladin) => ({ runtime: runtime(paladin), environment }), { ...SET, VIVA_PROBE_SERVE: "not a url" });
    expect(instance.runtime.statics.serve).toBe("not a url");
    expect(instance.faults).toEqual(["runtime.statics.serve must be RFC 3986 URI with an authority (scheme://…)"]);
    expect(sentences(instance)).toEqual([
      "SECRET_VIVA_PROBE_A REQUIRED",
      "VIVA_PROBE_SERVE INVALID at runtime.statics.serve — must be RFC 3986 URI with an authority (scheme://…)",
    ]);
  });
  it("a thunk element that yields null is dormant, not a fault; a thunk on the key that yields null is an empty roster", async () => {
    const element = await mount((paladin) => ({ lighthouse: lighthouse(paladin), daemons: [daemon({ hallucinators: [() => null, anthropic(paladin)] })], environment }), SET, { SECRET_VIVA_PROBE_A: "a" });
    expect(element.daemons[0].hallucinators.map((mask) => mask.module)).toEqual(["@commons/hallucinator/anthropic"]);
    expect(element.dormant).toEqual(["daemon[probe].hallucinators[0]"]);
    expect(element.faults).toEqual([]);
    const key = await mount((paladin) => ({ lighthouse: lighthouse(paladin), daemons: [daemon({ hallucinators: () => null })], environment }), SET);
    expect(key.daemons[0].hallucinators).toEqual([]);
    expect(key.dormant).toEqual([]);
    expect(key.faults).toEqual([]);
  });
});

const office = (paladin) =>
  daemon({
    kernel: [
      "@vcompany/domain/voffice",
      { module: "@vcompany/office/vdex", mountpoint: () => paladin.env.get("VIVA_PROBE_VDEX"), statics: { formats: ["md"] } },
      { module: "@vcompany/office/email", statics: { poll: 60 } },
    ],
  });

const officeEnvironment = v.environment({
  VIVA_PROBE_SERVE: v.url().desc("serve"),
  VIVA_PROBE_REMOTE: v.url().desc("remote"),
  VIVA_PROBE_VDEX: v.string().desc("the jdex directory"),
});

const officeInstance = (paladin) => ({
  runtime: runtime(paladin),
  lighthouse: lighthouse(paladin),
  daemons: [office(paladin)],
  environment: officeEnvironment,
});

const relativeInstance = (paladin) => ({
  ...officeInstance(paladin),
  daemons: [daemon({ kernel: [{ module: "@vcompany/office/chat", mountpoint: "./chats" }] })],
});

describe("settle — a kernel entry in object form fires at the pinhole like any mask", () => {
  it("the mountpoint thunk fires and lands as a Path; the entry keeps its module and statics; the string entry beside it is untouched", async () => {
    const instance = await mount(officeInstance, { ...SET, VIVA_PROBE_VDEX: "/jdex" });
    const [domain, entry] = instance.daemons[0].kernel;
    expect(domain).toBe("@vcompany/domain/voffice");
    expect(entry.module).toBe("@vcompany/office/vdex");
    expect(entry.mountpoint).toBeInstanceOf(Path);
    expect(entry.mountpoint.absolute).toBe("/jdex");
    expect(entry.statics).toEqual({ formats: ["md"] });
    expect(instance.faults).toEqual([]);
  });

  it("an unset mountpoint is REQUIRED at its slot — the doctor names the entry; nothing is minted over it", async () => {
    const instance = await mount(officeInstance, SET);
    expect(sentences(instance)).toContain("VIVA_PROBE_VDEX REQUIRED at daemon[probe].kernel[1].mountpoint");
    expect(instance.daemons[0].kernel[1].mountpoint).toBeNull();
  });

  it("an entry without a mountpoint stays without one — no data dir is minted", async () => {
    const instance = await mount(officeInstance, { ...SET, VIVA_PROBE_VDEX: "/jdex" });
    expect(instance.daemons[0].kernel[2].mountpoint).toBeUndefined();
    expect(instance.faults).toEqual([]);
  });

  it("a relative mountpoint is refused at mount — declared means absolute", async () => {
    await expect(mount(relativeInstance, SET)).rejects.toThrow(
      "instance.mount: daemon[probe].kernel[0].mountpoint must be absolute — ./chats",
    );
  });

  it("the daemon's own mount is unchanged by the entries under it", async () => {
    const instance = await mount(officeInstance, { ...SET, VIVA_PROBE_VDEX: "/jdex" });
    expect(instance.daemons[0].mount.absolute).toBe("/mountpoint/daemon_probe");
  });
});
