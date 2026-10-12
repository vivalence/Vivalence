import { specimen, middleware } from "@vivalence/typology";
import { Runtime } from "../../prototypes/runtime.js";
import { Daemon } from "../../prototypes/daemon.js";
import { Mode } from "../../prototypes/mode.js";
import { Thread } from "../../prototypes/thread/index.js";
import * as population from "../../lifecycle/client/population.js";
import * as daemon from "../../lifecycle/daemon/population.js";
import { recording } from "./wire.js";

const { describe, it, expect } = specimen;

const ROSTER = [{ slug: "hello", reference: "/daemon/hello", modes: 1, metadata: {} }];
const PROBE = { id: "m1", daemon: null, type: "home", slug: "probe", traits: [], metadata: {} };
const GREETING = { id: "m2", daemon: "hello", type: "demo", slug: "hello-world", traits: [], metadata: {} };
const THREADS = [
  { id: "t1", mode: "m2", traits: [], trait: {} },
  { id: "t2", mode: "m1", traits: [], trait: {} },
];
const TERMINALS = [{ id: "k1", daemon: "hello", thread: "t1", index: 0, traits: [], trait: {} }];

const answers = (overrides = {}) => ({
  "/metadata/manifest": () => ({ slug: "house" }),
  "/metadata/daemons": () => ROSTER,
  "/runtime/house/entities/mode/find": () => [PROBE],
  "/daemon/hello/entities/mode/find": () => [GREETING],
  "/userspace/entities/thread/find": () => THREADS,
  "/userspace/entities/terminal/find": () => TERMINALS,
  ...overrides,
});

const world = (overrides) => {
  const log = [];
  const root = recording(log, answers(overrides));
  const runtime = new Runtime({ remote: "stub://", lighthouse: { runtime: root } });
  const client = { runtime, terminals: null };
  const die = { client, controller: null };
  return { log, runtime, client, die };
};

const boot = (die, ...beats) => middleware.compose(beats)(die, async () => {});

describe("one em, every rung feeding it — the runtime host and each daemon manage their mode · literal · symbol into runtime.entities", () => {
  it("a daemon-borne mode cast through daemon.entities.mode IS the row runtime.entities.mode holds; daemon.modes and runtime.daemon.modes split them", async () => {
    const { runtime, die } = world();
    await boot(die, population.entities, population.daemons, population.modes);
    const [hello] = runtime.daemons;
    expect(hello).toBeInstanceOf(Daemon);
    expect([hello.id, hello.slug, hello.reference.absolute]).toEqual(["hello", "hello", "/daemon/hello"]);
    expect(hello.entities.mode.$entities).toBe(runtime.entities.mode.$entities);
    const greeting = runtime.entities.mode.findOneLocal({ id: "m2" });
    expect(greeting).toBeInstanceOf(Mode);
    expect(hello.entities.mode.findOneLocal({ id: "m2" })).toBe(greeting);
    expect(hello.modes).toEqual([greeting]);
    expect(runtime.daemon.modes.map((mode) => mode.id)).toEqual(["m1"]);
    expect(runtime.entities.mode.$entities.get().map((mode) => mode.id).sort()).toEqual(["m1", "m2"]);
  });

  it("mode.daemon keeps the wire's word (the Daemon, or null on the runtime); mode.host is the one a client calls", async () => {
    const { runtime, die } = world();
    await boot(die, population.entities, population.daemons, population.modes);
    const [hello] = runtime.daemons;
    const greeting = runtime.entities.mode.findOneLocal({ id: "m2" });
    const probe = runtime.entities.mode.findOneLocal({ id: "m1" });
    expect([greeting.daemon, greeting.host]).toEqual([hello, hello]);
    expect([probe.daemon, probe.host]).toEqual([null, runtime.daemon]);
    expect(greeting.reference.absolute).toBe("/daemon/hello/mode/demo/hello-world");
    expect(probe.reference.absolute).toBe("/runtime/house/mode/home/probe");
    expect(greeting.connection.url.pathname).toBe("/daemon/hello/mode/demo/hello-world");
    expect(runtime.daemon.$status).toBe(runtime.$status);
  });

  it("userspace cast after the modes: thread.mode · terminal.thread · terminal.daemon are the entities", async () => {
    const { runtime, die } = world();
    await boot(die, population.entities, population.daemons, population.modes, population.userspace);
    const [hello] = runtime.daemons;
    const greeting = runtime.entities.mode.findOneLocal({ id: "m2" });
    const thread = runtime.entities.thread.findOneLocal({ id: "t1" });
    const terminal = runtime.entities.terminal.findOneLocal({ id: "k1" });
    expect(thread).toBeInstanceOf(Thread);
    expect(thread.mode).toBe(greeting);
    expect(runtime.entities.thread.findOneLocal({ id: "t2" }).mode.id).toBe("m1");
    expect(terminal.thread).toBe(thread);
    expect(terminal.daemon).toBe(hello);
    expect(terminal.mode).toBe(greeting);
  });

  it("a host down at boot leaves its threads holding the mode id; its own modes beat re-finds and upgrades them to the entity", async () => {
    let reachable = false;
    const { runtime, die, client } = world({
      "/daemon/hello/entities/mode/find": () => {
        if (!reachable) throw Object.assign(new Error("down"), { type: "NETWORK" });
        return [GREETING];
      },
    });
    await boot(die, population.entities, population.daemons, population.modes, population.userspace);
    const thread = runtime.entities.thread.findOneLocal({ id: "t1" });
    expect(thread.mode).toBe("m2");
    expect(runtime.entities.thread.findOneLocal({ id: "t2" }).mode.id).toBe("m1");
    reachable = true;
    const [hello] = runtime.daemons;
    await daemon.modes({ daemon: hello, client }, async () => {
      expect(thread.mode).toBe(runtime.entities.mode.findOneLocal({ id: "m2" }));
      expect(hello.modes.map((mode) => mode.id)).toEqual(["m2"]);
    });
  });

  it("the beats call the wire in population order: manifest · datamap · daemons · modes per host · the six userspace names, threads before buffers", async () => {
    const { log, die } = world();
    await boot(die, population.entities, population.daemons, population.modes, population.userspace);
    const calls = log.map((entry) => entry.path);
    expect(calls.slice(0, 3)).toEqual(["/metadata/manifest", "/runtime/house/metadata/datamap", "/metadata/daemons"]);
    expect(calls.slice(3, 5).sort()).toEqual(["/daemon/hello/entities/mode/find", "/runtime/house/entities/mode/find"]);
    expect(calls.slice(5)).toEqual(["intent", "thread", "buffer", "turn", "activity", "terminal"].map((name) => `/userspace/entities/${name}/find`));
  });
});
