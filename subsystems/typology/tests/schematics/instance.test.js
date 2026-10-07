import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, Url, v } from "@vivalence/typology";

const { Instance, InstanceMask, Mountpoint, Modes, Daemon, Runtime } = v.primitives.instance;

const JWT = "a-signing-secret-of-twenty-four-or-more";
const runtime = (held = {}) => ({ manifest: { slug: "runtime" }, statics: { serve: "http://localhost:2501/" }, secrets: { jwt: JWT }, ...held });
const recipe = (held = {}) => ({ manifest: { type: "instance", slug: "probe" }, environment: {}, ...held });
const daemon = (held = {}) => ({
  manifest: { type: "daemon", slug: "hello" },
  mountpoint: "/m/daemon_hello",
  datamap: { module: "@commons/datamap/libsql", mountpoint: "/m/daemon_hello", statics: { db: { file: "hello.viva.db" } } },
  ...held,
});

const sentences = (value) => Instance.faults(value).map(({ at, reason }) => `${at} ${reason}`);

describe("v.primitives.instance — one schematic for the settled unit", () => {
  it("cast fills what a recipe leaves out — lists, statics, consume, traits", () => {
    const held = Instance.cast(recipe({ daemons: [daemon()] }));
    expect(held.clients).toEqual([]);
    expect(held.services).toEqual([]);
    expect(held.manifest.traits).toEqual([]);
    expect(held.daemons[0].statics).toEqual({});
    expect(held.daemons[0].modes).toEqual([]);
    expect(held.daemons[0].consume).toEqual({});
    expect(held.daemons[0].hallucinators).toEqual([]);
    expect(sentences(held)).toEqual([]);
  });

  it("a daemon owes only its manifest — no lighthouse, no datamap of its own; the lighthouse is the runtime's", () => {
    const bare = Instance.cast(recipe({ daemons: [{ manifest: { type: "daemon", slug: "hello" }, mountpoint: "/m/daemon_hello" }] }));
    expect(sentences(bare)).toEqual([]);
    expect("lighthouse" in v.primitives.instance).toBe(false);
  });

  it("decode mints the prototypes once: Url at every serve/remote, Path at every mountpoint", () => {
    const held = Instance.decode(Instance.cast(recipe({ runtime: runtime(), daemons: [daemon()] })));
    expect(held.runtime.statics.serve).toBeInstanceOf(Url);
    expect(held.daemons[0].mountpoint).toBeInstanceOf(Path);
  });

  it("the modes admits an identifier and a mode mask — an inline module object is refused", () => {
    const modes = [
      "@commons/playground/spawner",
      { module: "@vcompany/office/vdex", mountpoint: "/jdex", statics: { formats: ["md"] } },
      { module: "@vcompany/office/chat", mountpoint: null },
    ];
    expect(v.faults(Modes, modes)).toEqual([]);
    const held = v.decode(Modes, modes);
    expect(held[1].mountpoint).toBeInstanceOf(Path);
    expect(held[1].mountpoint.absolute).toBe("/jdex");
    expect(held[2].mountpoint).toBe(null);
    expect(v.faults(Modes, [{ manifest: { type: "game", slug: "inline" }, statics: {} }]).length).toBeGreaterThan(0);
  });

  it("the runtime's manifest is a slug — no type, it is not a package — and it signs with a secret of 24+", () => {
    expect(Runtime.faults(Runtime.cast(runtime()))).toEqual([]);
    expect(Runtime.faults(Runtime.cast(runtime({ manifest: {} }))).map(({ at }) => at)).toEqual(["/manifest"]);
    const { manifest, ...unnamed } = runtime();
    expect(Runtime.cast(unnamed).manifest).toEqual({ slug: "runtime" });
    expect(InstanceMask.faults({ manifest: { type: "instance", slug: "probe" }, runtime: { statics: { serve: "${VIVA_RUNTIME_SERVE}" } } })).toEqual([]);
    expect(Runtime.faults(Runtime.cast(runtime({ secrets: { jwt: "short" } }))).map(({ at }) => at)).toEqual(["/secrets/jwt"]);
    expect(Runtime.faults(Runtime.cast({ manifest: { slug: "runtime" }, statics: { serve: "http://localhost:2501/" } })).map(({ at }) => at)).toEqual(["/"]);
  });

  it("the schematic knows every mountpoint — collect walks daemons, datamaps, services and modes modes, skipping null", () => {
    const held = Instance.cast(
      recipe({
        services: [{ manifest: { type: "service", slug: "nlp" }, module: "@commons/service/nlp-stanza", mountpoint: "/m/service_nlp", datamap: { module: "@commons/datamap/libsql", mountpoint: "/m/service_nlp" } }],
        daemons: [daemon({ modes: [{ module: "@vcompany/office/vdex", mountpoint: "/jdex" }, { module: "@vcompany/office/chat", mountpoint: null }] })],
      }),
    );
    const seats = v.collect(Instance, held, Mountpoint);
    expect(seats.map(({ at }) => at)).toEqual([
      "/services/0/mountpoint",
      "/services/0/datamap/mountpoint",
      "/daemons/0/mountpoint",
      "/daemons/0/modes/0/mountpoint",
    ]);
    expect(seats.map(({ value }) => value)).toEqual(["/m/service_nlp", "/m/service_nlp", "/m/daemon_hello", "/jdex"]);
    expect(Instance.collect(Instance.decode(held), Mountpoint).every(({ value }) => value instanceof Path)).toBe(true);
  });

  it("a mountpoint is declared absolute", () => {
    expect(v.faults(Mountpoint, "/absolute/x")).toEqual([]);
    expect(v.faults(Mountpoint, "./relative")).toEqual([{ at: "/", reason: "must be an absolute path" }]);
    expect(Daemon.faults(Daemon.cast(daemon({ mountpoint: "relative" }))).map(({ at }) => at)).toEqual(["/mountpoint"]);
  });
});

describe("v.primitives.instance.InstanceMask — the file as authored: references, no seats, every key named", () => {
  const mask = (held = {}) => ({
    manifest: { type: "instance", slug: "hello-world", version: "0.0.1" },
    runtime: { manifest: { slug: "runtime" }, statics: { serve: "${VIVA_RUNTIME_SERVE}", remote: "${PUBLIC_VIVA_RUNTIME_REMOTE}" }, secrets: { jwt: "${SECRET_VIVA_JWT}" } },
    datamap: { module: "@commons/datamap/libsql" },
    hallucinators: [{ module: "@commons/hallucinator/anthropic", secrets: { key: "${SECRET_VIVA_ANTHROPIC_API_KEY}" } }],
    clients: [{ manifest: { type: "client", slug: "anima" }, statics: { serve: "${VIVA_CLIENT_ANIMA_SERVE}" } }],
    daemons: [{ manifest: { type: "daemon", slug: "hello", version: "0.0.1" }, modes: ["./mode.viva.js", { module: "@commons/editor/media", statics: { root: "${VIVA_ROOT}" } }], consume: { reader: { module: "@commons/service/reader" } } }],
    environment: { type: "object", required: ["VIVA_RUNTIME_SERVE", "SECRET_VIVA_JWT"], properties: { VIVA_RUNTIME_SERVE: { type: "string" }, SECRET_VIVA_JWT: { type: "string", minLength: 24 } }, additionalProperties: false },
    ...held,
  });
  const faults = (value) => InstanceMask.faults(value).map(({ at, reason }) => `${at} ${reason}`);

  it("the authored hello-world shape passes whole", () => {
    expect(faults(mask())).toEqual([]);
  });

  it("a client names its home — an absolute mode reference; any other key is refused", () => {
    expect(faults(mask({ clients: [{ manifest: { type: "client", slug: "anima" }, home: "/runtime/runtime/mode/home/home" }] }))).toEqual([]);
    expect(faults(mask({ clients: [{ manifest: { type: "client", slug: "anima" }, harness: "/runtime/runtime/mode/home/home" }] }))).toEqual(["/clients/0 must not have additional properties"]);
  });

  it("a migrated shelf that still says lighthouse is refused with the key named", () => {
    expect(faults(mask({ lighthouse: { module: "@commons/lighthouse/multiplayer" } }))).toEqual(["/ must not have additional properties"]);
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, lighthouse: {} }] }))).toEqual(["/daemons/0 must not have additional properties"]);
  });

  it("a secret is a ${SECRET_…} reference, never a value; a static is any string", () => {
    expect(faults(mask({ runtime: { manifest: { slug: "runtime" }, secrets: { jwt: "a-literal-secret-in-the-file" } } })).join(" ")).toContain("/runtime/secrets/jwt");
    expect(faults(mask({ hallucinators: [{ module: "m", secrets: { key: "${VIVA_NOT_A_SECRET}" } }] })).join(" ")).toContain("/hallucinators/0/secrets/key");
    expect(faults(mask({ datamap: { module: "m", statics: { file: "plain.db" } } }))).toEqual([]);
  });

  it("a mode mask carries module · manifest · mountpoint (nullable) · statics · secrets and nothing else", () => {
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", mountpoint: null, manifest: { name: "X" } }] }] }))).toEqual([]);
    expect(faults(mask({ daemons: [{ manifest: { type: "daemon", slug: "x" }, modes: [{ module: "m", application: {} }] }] })).join(" ")).toContain("/daemons/0/modes/0");
  });
});
