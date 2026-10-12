import { specimen, shard, Path } from "@vivalence/typology";
import { atom } from "nanostores";
import { lighthouse as scenario } from "@vivalence/runtime/scenarios";
import { Terminal, TerminalDossier, stall } from "../../prototypes/terminal.js";
import { Dataspace } from "../../prototypes/dataspace.js";
import { Daemon, DaemonDossier } from "../../prototypes/daemon.js";
import { ModeDossier } from "../../prototypes/mode.js";
import { LiteralDossier } from "../../prototypes/literal.js";
import { SymbolDossier } from "../../prototypes/symbol.js";
import { ThreadDossier } from "../../prototypes/thread/index.js";
import { BufferDossier } from "../../prototypes/buffer.js";
import { TurnDossier } from "../../prototypes/turn.js";
import { IntentDossier } from "../../prototypes/intent.js";
import { ActivityDossier } from "../../prototypes/activity.js";
import { terminal as standalone } from "../../traits/index.js";
import { recording } from "./wire.js";

const { describe, it, expect } = specimen;

const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
const until = async (predicate, ms = 1500) => {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > ms) throw new Error("until: timed out");
    await tick(5);
  }
};

const ROSTER = [{ slug: "hello", reference: "/daemon/hello", modes: 1, metadata: {} }];
const PROBE = { id: "m1", daemon: null, type: "home", slug: "probe", traits: [], metadata: {} };
const GREETING = { id: "m2", daemon: "hello", type: "demo", slug: "hello-world", traits: [], metadata: {} };

const world = async () => {
  const log = [];
  const root = recording(log, { "/metadata/daemons": () => ROSTER });
  const runtime = { entities: null, daemons: [], daemon: null };
  runtime.daemon = Object.assign(new Daemon(), { id: "house", slug: "house", reference: new Path("/runtime/house"), connection: root.branch("/runtime/house") });
  runtime.entities = new Dataspace({
    connection: root.branch("/runtime/house"),
    runtime: root,
    entities: [DaemonDossier, ModeDossier, LiteralDossier, SymbolDossier, TerminalDossier, IntentDossier, ThreadDossier, BufferDossier, TurnDossier, ActivityDossier],
    seed: (boot) => boot.use(shard.context.bind("runtime", runtime)),
  });
  await runtime.entities.init();
  await runtime.entities.daemon.find();
  const [probe, greeting] = await Promise.all([runtime.entities.mode.merge(PROBE), runtime.entities.mode.merge(GREETING)]);
  const writes = () => log.filter((entry) => entry.path.endsWith("/updateOne")).map((entry) => entry.body.data);
  return { log, writes, runtime, entities: runtime.entities, hello: runtime.entities.daemon.findOneLocal({ id: "hello" }), probe, greeting };
};

const buffer = (id, fields = {}) => {
  const hooks = [];
  return { id, ...fields, on: { release: (callback) => hooks.push(callback) }, done: () => hooks.forEach((hook) => hook()) };
};

const threadOf = (id, buffers = [], { phase = "manual", trait = {}, mode = null } = {}) => ({
  id,
  mode,
  trait,
  $buffers: atom(buffers),
  $phase: atom(phase),
});

const entitiesOf = (threads = []) => {
  const $threads = atom(threads);
  const $buffers = atom([]);
  const dropped = [];
  const removed = [];
  return {
    dropped,
    removed,
    thread: { $entities: $threads },
    buffer: {
      $entities: $buffers,
      drop: (id) => dropped.push(id),
      removeOne: async (where) => removed.push(where.id),
      merge: async (pojo) => pojo,
      create: async (data) => data,
    },
  };
};

describe("terminal.thread — the em resolves the row's thread into the entity; the vigil clears it when the row leaves", () => {
  it("cast after its thread: terminal.thread IS the Thread, terminal.daemon the Daemon, terminal.mode the thread's mode", async () => {
    const { entities, hello, greeting } = await world();
    const thread = await entities.thread.merge({ id: "t1", mode: "m2", traits: [], trait: {} });
    const terminal = await entities.terminal.merge({ id: "k1", daemon: "hello", thread: "t1", index: 0, traits: [], trait: {} });
    expect(terminal).toBeInstanceOf(Terminal);
    expect([terminal.thread, terminal.$thread.get(), terminal.daemon, terminal.mode]).toEqual([thread, thread, hello, greeting]);
    expect(terminal.repository).toBe(entities.terminal);
  });

  it("a merge moves the seat through the setter: null clears, an id seats", async () => {
    const { entities } = await world();
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", traits: [], trait: {} });
    const terminal = await entities.terminal.merge({ id: "k1", daemon: null, thread: null, index: 0, traits: [], trait: {} });
    expect([terminal.thread, terminal.mode]).toEqual([null, null]);
    await entities.terminal.merge({ id: "k1", thread: "t1" });
    expect(terminal.thread).toBe(thread);
    await entities.terminal.merge({ id: "k1", thread: null });
    expect(terminal.thread).toBe(null);
  });

  it("the vigil: a thread gone from runtime.entities.thread clears $thread and the stall", async () => {
    const { entities } = await world();
    await entities.thread.merge({ id: "t1", mode: "m1", traits: [], trait: {} });
    const terminal = await entities.terminal.merge({ id: "k1", daemon: null, thread: "t1", index: 0, traits: [], trait: {} });
    const release = stall(terminal, entities);
    expect(terminal.stall).not.toBe(null);
    entities.thread.drop("t1");
    expect([terminal.thread, terminal.stall]).toEqual([null, null]);
    release();
  });

  it("toJSON: the row — thread and daemon by id, no $ keys, no stall, no repository, no runtime", async () => {
    const { entities } = await world();
    await entities.thread.merge({ id: "t1", mode: "m2", traits: [], trait: {} });
    const terminal = await entities.terminal.merge({ id: "k1", user: "u1", daemon: "hello", thread: "t1", index: 0, traits: [], trait: {} });
    expect(JSON.parse(JSON.stringify(terminal))).toEqual({ id: "k1", user: "u1", daemon: "hello", thread: "t1", index: 0, traits: [], trait: {} });
  });
});

describe("Terminal.seat — the row records the thread and the daemon its mode is borne by", () => {
  it("a daemon-borne mode writes the daemon's slug, a runtime-borne mode writes null, null unseats", async () => {
    const { entities, writes } = await world();
    const terminal = await entities.terminal.merge({ id: "k1", daemon: null, thread: null, index: 0, traits: [], trait: {} });
    const [borne, home] = await Promise.all([
      entities.thread.merge({ id: "t1", mode: "m2", traits: [], trait: {} }),
      entities.thread.merge({ id: "t2", mode: "m1", traits: [], trait: {} }),
    ]);
    await terminal.seat(borne);
    expect(terminal.thread).toBe(borne);
    await terminal.seat(home);
    await terminal.seat(null);
    expect(writes()).toEqual([
      { daemon: "hello", thread: "t1" },
      { daemon: null, thread: "t2" },
      { daemon: null, thread: null },
    ]);
    expect(terminal.thread).toBe(null);
  });

  it("a thread whose mode's host is not mounted cannot be seated; the error names the id", async () => {
    const { entities } = await world();
    const terminal = await entities.terminal.merge({ id: "k1", daemon: null, thread: null, index: 0, traits: [], trait: {} });
    const held = await entities.thread.merge({ id: "t1", mode: "m9", traits: [], trait: {} });
    await expect(terminal.seat(held)).rejects.toThrow(/m9/);
  });

  it("write hands back the repository's promise for the caller to catch", async () => {
    const terminal = new Terminal();
    const failure = new Error("CLIENT");
    terminal.repository = { updateOne: () => Promise.reject(failure) };
    await expect(terminal.write({ thread: null })).rejects.toBe(failure);
  });
});

describe("stall — the terminal's stall over the seated thread's buffers", () => {
  it("manual: the first buffer is focused; a release advances, drops locally and removes on the wire", async () => {
    const [first, second] = [buffer("a"), buffer("b")];
    const thread = threadOf("t1", [first, second]);
    const entities = entitiesOf([thread]);
    const terminal = new Terminal();
    const release = stall(terminal, entities);
    terminal.$thread.set(thread);
    expect(terminal.$buffer.get().id).toBe("a");
    first.done();
    expect(terminal.$buffer.get().id).toBe("b");
    expect(entities.dropped).toEqual(["a"]);
    await tick();
    expect(entities.removed).toEqual(["a"]);
    thread.$phase.set("inert");
    terminal.$buffer.set(null);
    thread.$buffers.set([second]);
    expect(terminal.$buffer.get()).toBe(null);
    release();
  });

  it("continuous: the stall pulls through AIMED into runtime.entities.buffer to keep the depth filled", async () => {
    const thread = threadOf("t1", [], { phase: "inert", trait: { AIMED: { mount: "/emit/x" }, QUEUEING: { depth: 2 } } });
    let pulls = 0;
    thread.mode = { connection: { call: async () => (pulls++, { output: { buffer: [{ id: `p${pulls}` }] } }) } };
    const entities = entitiesOf([thread]);
    entities.buffer.merge = async (pojo) => {
      const merged = buffer(pojo.id);
      thread.$buffers.set([...thread.$buffers.get(), merged]);
      return merged;
    };
    const terminal = new Terminal();
    const release = stall(terminal, entities);
    terminal.$thread.set(thread);
    thread.$phase.set("continuous");
    await tick();
    expect(pulls).toBeGreaterThanOrEqual(1);
    expect(thread.$buffers.get().length).toBe(pulls);
    release();
  });

  it("a buffer gone from runtime.entities.buffer unfocuses; a thread gone from runtime.entities.thread unseats", () => {
    const focused = buffer("a");
    const thread = threadOf("t1", [focused]);
    const entities = entitiesOf([thread]);
    entities.buffer.$entities.set([focused]);
    const terminal = new Terminal();
    const release = stall(terminal, entities);
    terminal.$thread.set(thread);
    expect(terminal.$buffer.get()).toBe(focused);
    thread.$buffers.set([]);
    entities.buffer.$entities.set([]);
    expect(terminal.$buffer.get()).toBe(null);
    entities.thread.$entities.set([]);
    expect(terminal.$thread.get()).toBe(null);
    expect(terminal.stall).toBe(null);
    release();
  });

  it("moving to another thread clears the focus and builds a fresh stall; release deactivates it", () => {
    const [first, second] = [threadOf("t1", [buffer("a")]), threadOf("t2", [])];
    const entities = entitiesOf([first, second]);
    const terminal = new Terminal();
    const release = stall(terminal, entities);
    terminal.$thread.set(first);
    const held = terminal.stall;
    terminal.$thread.set(second);
    expect(terminal.$buffer.get()).toBe(null);
    expect(terminal.stall).not.toBe(held);
    release();
    expect(terminal.stall).toBe(null);
    terminal.$thread.set(first);
    expect(terminal.stall).toBe(null);
  });
});

describe("standalone.open — an entrypoint mode opens its buffer through its runtime's entities", () => {
  const entry = (minted, thread, create = (fields) => Promise.resolve(fields)) => ({
    id: "m1",
    slug: "dojo",
    runtime: {
      entities: {
        buffer: {
          create: async (data) => {
            minted.push(data);
            const created = buffer(`b${minted.length}`, await create(data));
            thread.$buffers.set([...thread.$buffers.get(), created]);
            return created;
          },
        },
      },
    },
  });

  const seated = (thread) => {
    const terminal = new Terminal();
    const release = stall(terminal, entitiesOf([thread]));
    terminal.$thread.set(thread);
    return { terminal, release };
  };

  it("a thread with no buffer on the mode mints one and the terminal shows it", async () => {
    const minted = [];
    const thread = threadOf("t1", []);
    const { terminal, release } = seated(thread);
    await standalone.open(terminal, entry(minted, thread));
    expect(minted).toEqual([{ mode: "m1", thread: "t1", data: {} }]);
    expect(terminal.$buffer.get().id).toBe("b1");
    release();
  });

  it("a thread that already holds buffers on the mode reopens its last one and mints none", async () => {
    const minted = [];
    const thread = threadOf("t1", []);
    const mode = entry(minted, thread);
    thread.$buffers.set([buffer("b1", { mode, index: 0 }), buffer("b2", { mode, index: 2 }), buffer("b3", { mode: { id: "m2" }, index: 5 })]);
    const { terminal, release } = seated(thread);
    await standalone.open(terminal, mode);
    expect(minted).toEqual([]);
    expect(terminal.$buffer.get().id).toBe("b2");
    release();
  });

  it("a terminal moved to another thread while the mint is in flight keeps that thread's screen", async () => {
    let settle = null;
    const minted = [];
    const thread = threadOf("t1", []);
    const { terminal, release } = seated(thread);
    const opening = standalone.open(terminal, entry(minted, thread, (fields) => new Promise((resolve) => (settle = () => resolve(fields)))));
    terminal.$thread.set(threadOf("t2", []));
    settle();
    await opening;
    expect(terminal.$buffer.get()).toBe(null);
    release();
  });
});

describe("terminals over the runtime's /userspace/entities — the remote repository and its subscription", { sanitizeOps: false, sanitizeResources: false }, () => {
  let house;
  let finn;
  const kinds = [TerminalDossier, IntentDossier, ThreadDossier, BufferDossier, TurnDossier, ActivityDossier];

  const client = async (username, access = null) => {
    let user;
    if (access === null) ({ user, access } = await house.signup(username));
    else user = (await house.connect(access).call("/lighthouse/verify", { access })).user;
    const connection = house.connect(access);
    const runtime = { slug: "runtime", daemon: null, daemons: [], entities: null };
    runtime.entities = new Dataspace({
      connection,
      runtime: connection,
      entities: kinds,
      seed: (boot) => boot.use(shard.context.bind("runtime", runtime)),
    });
    await runtime.entities.init();
    await runtime.entities.populate(["thread", "buffer", "turn", "terminal"]);
    const releases = [];
    const mount = (terminal) => releases.push(stall(terminal, runtime.entities));
    for (const terminal of runtime.entities.terminal.$entities.get()) mount(terminal);
    const create = async () => {
      const terminal = await runtime.entities.terminal.create({});
      mount(terminal);
      return terminal;
    };
    const row = (terminal) => connection.call("/userspace/entities/terminal/findOne", { where: { id: terminal.id } });
    const close = () => releases.forEach((release) => release());
    return { user, access, connection, runtime, create, row, close };
  };

  specimen.beforeAll(async () => {
    house = await scenario.create();
    house.aperture.branch("/metadata").open("/datamap", () => shard.datamap.strip(house.datamap.orm.getMetadata()));
    finn = await client("finn");
  });
  specimen.afterAll(async () => {
    finn.close();
    await house.close();
  });

  it("create seats index 0 then 1; the entity is a Terminal that knows its repository", async () => {
    const first = await finn.create();
    const second = await finn.create();
    expect(first).toBeInstanceOf(Terminal);
    expect([first.index, second.index]).toEqual([0, 1]);
    expect(first.repository).toBe(finn.runtime.entities.terminal);
    expect(finn.runtime.entities.terminal.$entities.get().length).toBe(2);
  });

  it("two walls: another user sees none of finn's rows and starts its own index at 0", async () => {
    const kiro = await client("kiro");
    expect(kiro.runtime.entities.terminal.$entities.get()).toEqual([]);
    const widened = await kiro.connection.call("/userspace/entities/terminal/find", { where: { user: finn.user.id } });
    expect(widened).toEqual([]);
    expect((await kiro.create()).index).toBe(0);
    kiro.close();
  });

  it("seat writes the row; the answer resolves terminal.thread to the Thread; the stall focuses its buffer", async () => {
    const thread = await finn.runtime.entities.thread.create({ trait: {} });
    await finn.runtime.entities.buffer.create({ thread: thread.id, data: { word: "ciao" } });
    const [first] = finn.runtime.entities.terminal.$entities.get();
    await first.seat(thread);
    expect((await finn.row(first)).thread).toBe(thread.id);
    expect(first.thread).toBe(thread);
    expect(first.$buffer.get().data).toEqual({ word: "ciao" });
  });

  it("subscription: a second client of the same user sees the seat move without a reload", async () => {
    const twin = await client("finn", finn.access);
    const offs = ["terminal", "thread"].map((kind) => twin.runtime.entities[kind].subscribe());
    await tick(50);
    const [first] = finn.runtime.entities.terminal.$entities.get();
    const thread = first.thread;
    const mirror = twin.runtime.entities.terminal.$entities.get().find((terminal) => terminal.id === first.id);
    await until(() => mirror.thread !== null);
    expect(mirror.thread.id).toBe(thread.id);
    expect(mirror.thread).toBe(twin.runtime.entities.thread.findOneLocal({ id: thread.id }));
    await first.seat(null);
    await until(() => mirror.thread === null);
    expect(mirror.daemon).toBe(null);
    await first.seat(thread);
    await until(() => mirror.thread !== null);
    expect(mirror.thread.id).toBe(thread.id);
    offs.forEach((off) => off());
    twin.close();
  });

  it("a thread removed on the wire unseats the terminal: the vigil clears $thread, the row's thread is nulled by the runtime", async () => {
    const [first] = finn.runtime.entities.terminal.$entities.get();
    const thread = first.thread;
    await finn.runtime.entities.thread.removeOne({ id: thread.id });
    await until(() => first.thread === null);
    expect((await finn.row(first)).thread).toBe(null);
  });

  it("toJSON: no $ keys, no stall, no repository", () => {
    const [first] = finn.runtime.entities.terminal.$entities.get();
    const json = JSON.parse(JSON.stringify(first));
    expect(Object.keys(json).filter((key) => key.startsWith("$") || ["stall", "repository", "runtime"].includes(key))).toEqual([]);
    expect(json.index).toBe(0);
  });
});
