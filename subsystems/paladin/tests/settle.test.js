import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, Url, v } from "@vivalence/typology";
import { Paladin } from "../prototypes/paladin.js";
import * as lifecycle from "../lifecycle/index.js";

const HOME = new Path("/fixtures/probe/test.viva.js");

const mount = (declare, pairs = {}, secrets = {}) => {
  const paladin = new Paladin();
  paladin.scopes([
    ["instance", () => true, () => new Path("/fixtures/probe/test.viva.js")],
    ["mountpoint", () => true, () => new Path("/mountpoint")],
  ]);
  for (const [key, value] of Object.entries(pairs)) paladin.env.set(key, value, "flag");
  for (const [key, value] of Object.entries(secrets)) paladin.secret.set(key, value, "flag");
  const module = { manifest: { type: "instance", slug: "probe", version: "0.0.1" }, source: HOME, ...declare(paladin) };
  paladin.find.type = async () => [module];
  return lifecycle.mount(lifecycle.populate.instance(paladin));
};

const runtime = (paladin) => ({
  manifest: { slug: "runtime" },
  statics: { serve: () => paladin.env.get("VIVA_PROBE_SERVE") },
});
const lighthouse = (paladin) => ({
  module: "@commons/lighthouse/multiplayer",
  statics: { remote: () => paladin.env.get("VIVA_PROBE_REMOTE") },
});
const libsql = { module: "@commons/datamap/libsql" };
const daemon = (extra = {}) => ({ manifest: { type: "daemon", slug: "probe", version: "0.0.1" }, ...extra });
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
const multiplayer = (paladin) => ({
  manifest: { type: "service", slug: "multiplayer" },
  module: "@commons/lighthouse/multiplayer",
  secrets: { jwt: () => paladin.secret.get("SECRET_VIVA_PROBE_A") },
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

  it("statics, consume, hallucinators and kernel need not be authored — the schematic fills them", async () => {
    const instance = await mount((paladin) => ({ lighthouse: lighthouse(paladin), datamap: libsql, daemons: [daemon()], environment }), SET);
    const [held] = instance.daemons;
    expect(held.statics).toEqual({});
    expect(held.consume).toEqual({});
    expect(held.hallucinators).toEqual([]);
    expect(held.kernel).toEqual([]);
    expect(instance.faults).toEqual([]);
  });

  it("the root datamap is every mounting's default: a COPY, seated in the mounting's directory, its file named for the mounting", async () => {
    const instance = await mount(
      (paladin) => ({ lighthouse: lighthouse(paladin), datamap: libsql, daemons: [daemon()], services: [multiplayer(paladin)], environment }),
      SET,
      { SECRET_VIVA_PROBE_A: "a" },
    );
    const [held] = instance.daemons;
    const [service] = instance.services;
    expect(held.datamap).not.toBe(instance.datamap);
    expect(held.datamap.module).toBe("@commons/datamap/libsql");
    expect(held.datamap.mountpoint).toBeInstanceOf(Path);
    expect(held.datamap.mountpoint.absolute).toBe("/mountpoint/daemon_probe");
    expect(held.datamap.statics.db.file).toBe("probe.viva.db");
    expect(service.mountpoint.absolute).toBe("/mountpoint/service_multiplayer");
    expect(service.datamap.mountpoint.absolute).toBe("/mountpoint/service_multiplayer");
    expect(service.datamap.statics.db.file).toBe("multiplayer.viva.db");
    expect(instance.datamap.mountpoint).toBeUndefined();
    expect(instance.faults).toEqual([]);
  });

  it("a mounting's own datamap keeps its file; the seat is still stamped", async () => {
    const instance = await mount(
      (paladin) => ({
        lighthouse: lighthouse(paladin),
        datamap: libsql,
        daemons: [daemon({ datamap: { module: "@elsewhere/datamap/pg", statics: { db: { file: "legacy.viva.db" } } } })],
        environment,
      }),
      SET,
    );
    const [held] = instance.daemons;
    expect(held.datamap.module).toBe("@elsewhere/datamap/pg");
    expect(held.datamap.statics.db.file).toBe("legacy.viva.db");
    expect(held.datamap.mountpoint.absolute).toBe("/mountpoint/daemon_probe");
  });

  it("root hallucinators are every daemon's default, whole-slot: a daemon declaring its own replaces the list", async () => {
    const instance = await mount(
      (paladin) => ({
        lighthouse: lighthouse(paladin),
        datamap: libsql,
        hallucinators: [anthropic(paladin), deepgram(paladin)],
        daemons: [daemon(), daemon({ manifest: { type: "daemon", slug: "other" }, hallucinators: [deepgram(paladin)] })],
        environment,
      }),
      SET,
      { SECRET_VIVA_PROBE_A: "a", SECRET_VIVA_PROBE_D: "d" },
    );
    const [probe, other] = instance.daemons;
    expect(probe.hallucinators.map((mask) => mask.module)).toEqual(["@commons/hallucinator/anthropic", "@commons/hallucinator/deepgram"]);
    expect(probe.hallucinators).not.toBe(instance.hallucinators);
    expect(other.hallucinators.map((mask) => mask.module)).toEqual(["@commons/hallucinator/deepgram"]);
    expect(instance.requirements.map((row) => row.at)).toEqual([
      "lighthouse.statics.remote",
      "hallucinators[0].secrets.key",
      "hallucinators[1].secrets.key",
      "daemon[other].hallucinators[0].secrets.key",
    ]);
    expect(instance.faults).toEqual([]);
  });

  it("a hallucinator whose secret is blank is dormant: off the roster, named on the instance, still in the record", async () => {
    const instance = await mount(
      (paladin) => ({
        lighthouse: lighthouse(paladin),
        datamap: libsql,
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

  it("a root hallucinator whose secret is blank is dormant in every daemon that inherited it — the record row is the root's", async () => {
    const instance = await mount(
      (paladin) => ({
        lighthouse: lighthouse(paladin),
        datamap: libsql,
        hallucinators: [anthropic(paladin), deepgram(paladin)],
        daemons: [daemon(), daemon({ manifest: { type: "daemon", slug: "other" } })],
        environment,
      }),
      SET,
      { SECRET_VIVA_PROBE_A: "canary" },
    );
    expect(instance.daemons.map((held) => held.hallucinators.map((mask) => mask.module))).toEqual([
      ["@commons/hallucinator/anthropic"],
      ["@commons/hallucinator/anthropic"],
    ]);
    expect(instance.dormant).toEqual(["daemon[probe].hallucinators[1]", "daemon[other].hallucinators[1]"]);
    expect(instance.requirements.map((row) => row.at)).toContain("hallucinators[1].secrets.key");
    expect(instance.faults).toEqual([]);
  });

  it("a consumed service whose secret is blank is dormant: off the daemon, named on the instance", async () => {
    const instance = await mount(
      (paladin) => ({
        lighthouse: lighthouse(paladin),
        datamap: libsql,
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
      datamap: libsql,
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

  it("inheritance happens before settle: a daemon's inherited lighthouse is its OWN decoded copy", async () => {
    const instance = await mount((paladin) => ({ lighthouse: lighthouse(paladin), datamap: libsql, daemons: [daemon()], environment }), SET);
    const [held] = instance.daemons;
    expect(held.lighthouse).not.toBe(instance.lighthouse);
    expect(held.lighthouse.statics.remote).toBeInstanceOf(Url);
    expect(held.lighthouse.statics.remote.absolute).toBe("http://localhost:2501/lighthouse");
    expect(instance.lighthouse.statics.remote).toBeInstanceOf(Url);
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
    const element = await mount((paladin) => ({ lighthouse: lighthouse(paladin), datamap: libsql, daemons: [daemon({ hallucinators: [() => null, anthropic(paladin)] })], environment }), SET, { SECRET_VIVA_PROBE_A: "a" });
    expect(element.daemons[0].hallucinators.map((mask) => mask.module)).toEqual(["@commons/hallucinator/anthropic"]);
    expect(element.dormant).toEqual(["daemon[probe].hallucinators[0]"]);
    expect(element.faults).toEqual([]);
    const key = await mount((paladin) => ({ lighthouse: lighthouse(paladin), datamap: libsql, daemons: [daemon({ hallucinators: () => null })], environment }), SET);
    expect(key.daemons[0].hallucinators).toEqual([]);
    expect(key.dormant).toEqual([]);
    expect(key.faults).toEqual([]);
  });

  it("identity is a manifest everywhere — runtime, client and service rows are labeled by it", async () => {
    const instance = await mount(
      (paladin) => ({
        runtime: runtime(paladin),
        lighthouse: lighthouse(paladin),
        datamap: libsql,
        clients: [{ manifest: { type: "client", slug: "kajuit", traits: ["ATTACHED"] }, statics: { serve: () => paladin.env.get("VIVA_PROBE_SERVE") } }],
        services: [multiplayer(paladin)],
        environment,
      }),
      SET,
      { SECRET_VIVA_PROBE_A: "a" },
    );
    expect(instance.clients[0].manifest.traits).toEqual(["ATTACHED"]);
    expect(instance.clients[0].statics.serve).toBeInstanceOf(Url);
    expect(instance.requirements.map((row) => row.at)).toContain("client[kajuit].statics.serve");
    expect(instance.requirements.map((row) => row.at)).toContain("service[multiplayer].secrets.jwt");
    expect(instance.faults).toEqual([]);
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
  datamap: libsql,
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

  it("the daemon's own seat is unchanged by the entries under it", async () => {
    const instance = await mount(officeInstance, { ...SET, VIVA_PROBE_VDEX: "/jdex" });
    expect(instance.daemons[0].mountpoint.absolute).toBe("/mountpoint/daemon_probe");
  });
});
