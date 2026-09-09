import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Path, Url, v } from "@vivalence/typology";

const { Instance, Mountpoint, Kernel, Daemon, Runtime } = v.primitives.instance;

const recipe = (held = {}) => ({ manifest: { type: "instance", slug: "probe" }, environment: {}, ...held });
const daemon = (held = {}) => ({
  manifest: { type: "daemon", slug: "hello" },
  mountpoint: "/m/daemon_hello",
  lighthouse: { module: "@commons/lighthouse/multiplayer", statics: { remote: "http://lighthouse/" } },
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
    expect(held.daemons[0].kernel).toEqual([]);
    expect(held.daemons[0].consume).toEqual({});
    expect(held.daemons[0].hallucinators).toEqual([]);
    expect(sentences(held)).toEqual([]);
  });

  it("a daemon owes its lighthouse and datamap — the fault points at the daemon", () => {
    const bare = Instance.cast(recipe({ daemons: [{ manifest: { type: "daemon", slug: "hello" }, mountpoint: "/m/daemon_hello" }] }));
    expect(sentences(bare).join(" · ")).toContain("/daemons/0 must have required properties");
    expect(sentences(bare).join(" · ")).toContain("lighthouse");
    expect(sentences(bare).join(" · ")).toContain("datamap");
  });

  it("decode mints the prototypes once: Url at every serve/remote, Path at every mountpoint", () => {
    const held = Instance.decode(
      Instance.cast(
        recipe({
          runtime: { manifest: { slug: "runtime" }, statics: { serve: "http://localhost:2501/" } },
          daemons: [daemon()],
        }),
      ),
    );
    expect(held.runtime.statics.serve).toBeInstanceOf(Url);
    expect(held.daemons[0].mountpoint).toBeInstanceOf(Path);
    expect(held.daemons[0].datamap.mountpoint).toBeInstanceOf(Path);
    expect(held.daemons[0].lighthouse.statics.remote).toBeInstanceOf(Url);
  });

  it("the kernel admits a reference, a mode, and an inline module — a mode's mountpoint decodes, null stays null", () => {
    const kernel = [
      "@commons/playground/spawner",
      { module: "@vcompany/office/vdex", mountpoint: "/jdex", statics: { formats: ["md"] } },
      { module: "@vcompany/office/chat", mountpoint: null },
      { manifest: { type: "game", slug: "inline" }, statics: { probe: () => 1 } },
    ];
    expect(v.faults(Kernel, kernel)).toEqual([]);
    const held = v.decode(Kernel, kernel);
    expect(held[1].mountpoint).toBeInstanceOf(Path);
    expect(held[1].mountpoint.absolute).toBe("/jdex");
    expect(held[2].mountpoint).toBe(null);
    expect(typeof held[3].statics.probe).toBe("function");
  });

  it("the runtime's manifest is a slug — no type, it is not a package", () => {
    expect(Runtime.faults(Runtime.cast({ manifest: { slug: "runtime" }, statics: { serve: "http://localhost:2501/" } }))).toEqual([]);
    expect(Runtime.faults(Runtime.cast({ manifest: {}, statics: { serve: "http://localhost:2501/" } })).map(({ at }) => at)).toEqual(["/manifest"]);
  });

  it("the schematic knows every mountpoint — collect walks daemons, datamaps, services and kernel modes, skipping null", () => {
    const held = Instance.cast(
      recipe({
        services: [{ manifest: { type: "service", slug: "multiplayer" }, module: "@commons/lighthouse/multiplayer", mountpoint: "/m/service_multiplayer", datamap: { module: "@commons/datamap/libsql", mountpoint: "/m/service_multiplayer" } }],
        daemons: [daemon({ kernel: [{ module: "@vcompany/office/vdex", mountpoint: "/jdex" }, { module: "@vcompany/office/chat", mountpoint: null }] })],
      }),
    );
    const seats = v.collect(Instance, held, Mountpoint);
    expect(seats.map(({ at }) => at)).toEqual([
      "/services/0/mountpoint",
      "/services/0/datamap/mountpoint",
      "/daemons/0/mountpoint",
      "/daemons/0/kernel/0/mountpoint",
      "/daemons/0/datamap/mountpoint",
    ]);
    expect(seats.map(({ value }) => value)).toEqual(["/m/service_multiplayer", "/m/service_multiplayer", "/m/daemon_hello", "/jdex", "/m/daemon_hello"]);
    expect(Instance.collect(Instance.decode(held), Mountpoint).every(({ value }) => value instanceof Path)).toBe(true);
  });

  it("a mountpoint is declared absolute", () => {
    expect(v.faults(Mountpoint, "/absolute/x")).toEqual([]);
    expect(v.faults(Mountpoint, "./relative")).toEqual([{ at: "/", reason: "must be an absolute path" }]);
    expect(Daemon.faults(Daemon.cast(daemon({ mountpoint: "relative" }))).map(({ at }) => at)).toEqual(["/mountpoint"]);
  });
});
