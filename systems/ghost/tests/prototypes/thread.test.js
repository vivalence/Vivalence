import { specimen, shard, Path } from "@vivalence/typology";
import { Dataspace } from "../../prototypes/dataspace.js";
import { Daemon } from "../../prototypes/daemon.js";
import { Thread, ThreadDossier } from "../../prototypes/thread/index.js";
import { thread as threadTraits } from "../../traits/index.js";
import { BufferDossier } from "../../prototypes/buffer.js";
import { TurnDossier } from "../../prototypes/turn.js";
import { ActivityDossier, roster, loudest, owed, settled } from "../../prototypes/activity.js";
import { IntentDossier } from "../../prototypes/intent.js";
import { Mode, ModeDossier } from "../../prototypes/mode.js";
import { recording } from "./wire.js";

const { describe, it, expect } = specimen;

const world = (answers = {}) => {
  const log = [];
  const root = recording(log, answers);
  const runtime = { entities: null, daemons: [], daemon: null };
  runtime.daemon = Object.assign(new Daemon(), { id: "house", slug: "house", reference: new Path("/runtime/house"), connection: root.branch("/runtime/house") });
  runtime.entities = new Dataspace({
    connection: root.branch("/runtime/house"),
    runtime: root,
    entities: [ModeDossier, IntentDossier, ThreadDossier, BufferDossier, TurnDossier, ActivityDossier],
    seed: (boot) => boot.use(shard.context.bind("runtime", runtime)),
  });
  const mode = (fields) => runtime.entities.mode.merge({ daemon: null, type: "game", traits: [], metadata: {}, ...fields });
  return { log, runtime, entities: runtime.entities, mode, ready: runtime.entities.init() };
};

describe("Thread — $buffers and $turns are this thread's rows of the one runtime.entities", () => {
  it("$buffers keeps the buffers the em resolved onto this thread and follows the store", async () => {
    const { entities, ready } = world();
    await ready;
    const thread = await entities.thread.merge({ id: "t1", traits: [], trait: {} });
    await entities.thread.merge({ id: "t2", traits: [], trait: {} });
    await entities.buffer.merge({ id: "b1", thread: "t1" });
    await entities.buffer.merge({ id: "b2", thread: { id: "t2" } });
    await entities.buffer.merge({ id: "b3", thread: null });
    await entities.buffer.merge({ id: "b4", thread: { id: "t1" } });
    expect(thread.$buffers.get().map((buffer) => buffer.id)).toEqual(["b1", "b4"]);
    expect(entities.buffer.findOneLocal({ id: "b1" }).thread).toBe(thread);
    entities.buffer.drop("b1");
    expect(thread.$buffers.get().map((buffer) => buffer.id)).toEqual(["b4"]);
  });

  it("$turns keeps this thread's turns in the order they were made, whatever order they land in", async () => {
    const { entities, ready } = world();
    await ready;
    const thread = await entities.thread.merge({ id: "t1", traits: [], trait: {} });
    await entities.turn.merge({ id: "c", thread: "t1", createdAt: "2026-10-11T10:00:03.000Z" });
    await entities.turn.merge({ id: "a", thread: "t1", createdAt: "2026-10-11T10:00:01.000Z" });
    await entities.turn.merge({ id: "x", thread: "t9", createdAt: "2026-10-11T10:00:00.000Z" });
    await entities.turn.merge({ id: "b", thread: { id: "t1" }, createdAt: "2026-10-11T10:00:02.000Z" });
    expect(thread.$turns.get().map((turn) => turn.id)).toEqual(["a", "b", "c"]);
  });
});

describe("Thread — mode is the Mode the em resolves; a mode not yet cast stays its id until a merge upgrades it", () => {
  it("cast after its mode: thread.mode IS the Mode and the label derives from it", async () => {
    const { entities, mode, ready } = world();
    await ready;
    const dojo = await mode({ id: "m1", slug: "dojo", name: "Dojo" });
    expect(dojo).toBeInstanceOf(Mode);
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", traits: [], trait: {} });
    expect(thread.mode).toBe(dojo);
    expect(thread.label).toEqual({ name: "Dojo", description: null, flags: [] });
    expect(thread.traits.includes("LABELED")).toBe(true);
  });

  it("cast before its mode: the id; thread.merge({ id, mode }) upgrades to the entity and the label re-derives", async () => {
    const { entities, mode, ready } = world();
    await ready;
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", traits: [], trait: {} });
    expect(thread.mode).toBe("m1");
    expect(thread.label.name).toBe(".unnamed");
    const dojo = await mode({ id: "m1", slug: "dojo", name: "Dojo" });
    expect(thread.mode).toBe("m1");
    await entities.thread.merge({ id: "t1", mode: "m1" });
    expect(thread.mode).toBe(dojo);
    expect(thread.label.name).toBe("Dojo");
  });

  it("an explicit LABELED trait outranks the mode and moves when the trait does", async () => {
    const { entities, mode, ready } = world();
    await ready;
    await mode({ id: "m1", slug: "dojo" });
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", traits: ["LABELED"], trait: { LABELED: { name: "mine" } } });
    expect(thread.label.name).toBe("mine");
    await entities.thread.merge({ id: "t1", trait: { LABELED: { name: "renamed" } } });
    expect(thread.label.name).toBe("renamed");
  });

  it("a populated mode reference on the wire resolves through the identity map; toJSON writes the id", async () => {
    const { entities, mode, ready } = world();
    await ready;
    const dojo = await mode({ id: "m1", slug: "dojo" });
    const thread = await entities.thread.merge({ id: "t1", mode: { id: "m1", slug: "dojo" }, traits: [], trait: {} });
    expect(thread.mode).toBe(dojo);
    expect(thread.toJSON().mode).toBe("m1");
  });

  it("MASKED follows an APPLICATION mode whose schema is not empty", async () => {
    const { entities, mode, ready } = world();
    await ready;
    const plain = await mode({ id: "m1", slug: "plain" });
    const masked = await mode({ id: "m2", slug: "masked", traits: ["APPLICATION"], application: { schema: { properties: { recall: {} } } } });
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", traits: [], trait: {} });
    expect(thread.traits.includes("MASKED")).toBe(false);
    thread.mode = masked;
    expect(thread.traits.includes("MASKED")).toBe(true);
    thread.mode = plain;
    expect(thread.traits.includes("MASKED")).toBe(false);
  });

  it("a mode is written through entities.thread.updateOne and its echo resolves; setting it locally writes nothing", async () => {
    const { entities, mode, log, ready } = world();
    await ready;
    const [one, two] = [await mode({ id: "m1", slug: "one" }), await mode({ id: "m2", slug: "two" })];
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", traits: [], trait: {} });
    thread.mode = two;
    thread.mode = one;
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(log.filter((entry) => entry.path.endsWith("/updateOne"))).toEqual([]);
    await Promise.all([entities.thread.updateOne({ id: "t1" }, { mode: "m2" }), entities.thread.updateOne({ id: "t1" }, { mode: "m1" })]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(log.filter((entry) => entry.path.endsWith("/updateOne")).length).toBe(2);
    expect(thread.mode).toBe(one);
  });
});

describe("Thread — the phase gate", () => {
  it("continuous needs an AIMED mount that resolves to an emitter; manual needs nothing", async () => {
    const { entities, mode, ready } = world();
    await ready;
    await mode({ id: "m1", slug: "aimed", metadata: { emitter: { branches: { literal: {} } } } });
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", traits: [], trait: {} });
    expect(thread.integrity).toEqual({ inert: [], manual: [], continuous: ["AIMED has no mount"], escort: [] });
    expect(thread.engage("continuous")).toBe(false);
    expect(thread.$errors.get()).toEqual(["AIMED has no mount"]);
    expect(thread.phase).toBe("manual");
    thread.trait = { AIMED: { mount: "/emit/literal" }, QUEUEING: { depth: 0 } };
    expect(thread.integrity.continuous).toEqual(["QUEUEING depth < 1"]);
    thread.trait = { AIMED: { mount: "/emit/literal" } };
    expect(thread.engage("continuous")).toBe(true);
    expect(thread.phase).toBe("continuous");
  });

  it("an AIMED mount on a thread whose mode's host is not mounted resolves to no emitter", async () => {
    const { entities, ready } = world();
    await ready;
    const thread = await entities.thread.merge({ id: "t1", mode: "m9", traits: [], trait: { AIMED: { mount: "/emit/x" } } });
    expect(thread.integrity.continuous).toEqual(["AIMED mount resolves to no emitter"]);
  });

  it("aimed.pull calls the mode's mount on the mode's connection with the mask and merges what it yields into runtime.entities.buffer", async () => {
    const { entities, mode, log, ready } = world({
      "/runtime/house/mode/game/e/emit/literal": () => ({ output: { buffer: [{ id: "p1", thread: "t1" }] } }),
    });
    await ready;
    await mode({ id: "m1", slug: "e" });
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", traits: [], trait: { AIMED: { mount: "/emit/literal" }, MASKED: { where: { word: "ciao" } } } });
    const pulled = await threadTraits.aimed.pull(thread, entities, { limit: 1 });
    expect(log.at(-1)).toEqual({ path: "/runtime/house/mode/game/e/emit/literal", body: { thread: "t1", where: { word: "ciao" }, limit: 1 } });
    expect(pulled.map((buffer) => buffer.id)).toEqual(["p1"]);
    expect(pulled[0].thread).toBe(thread);
    expect(thread.$buffers.get().map((buffer) => buffer.id)).toEqual(["p1"]);
    expect(threadTraits.queueing.depth(thread)).toBe(1);
  });
});

describe("Thread.toJSON and the activity roster", () => {
  it("toJSON carries the plain values and no store", async () => {
    const { entities, ready } = world();
    await ready;
    const thread = await entities.thread.merge({ id: "t1", mode: "m1", phase: "manual", traits: [], trait: { QUEUEING: { depth: 2 } } });
    const json = JSON.parse(JSON.stringify(thread));
    expect(Object.keys(json).filter((key) => key.startsWith("$"))).toEqual([]);
    expect(json).toEqual({ id: "t1", mode: "m1", phase: "manual", traits: ["LABELED"], trait: { QUEUEING: { depth: 2 } }, label: { name: ".unnamed", description: null, flags: [] } });
    expect(thread).toBeInstanceOf(Thread);
  });

  it("roster lists a thread's activities from runtime.entities.activity; loudest names the live state", async () => {
    const { entities, ready } = world();
    await ready;
    const thread = await entities.thread.merge({ id: "t1", traits: [], trait: {} });
    const $roster = roster(entities, thread);
    await entities.activity.merge({ id: "a1", thread: "t1", status: "PAUSED" });
    await entities.activity.merge({ id: "a2", thread: "t2", status: "RUNNING" });
    await entities.activity.merge({ id: "a3", thread: { id: "t1" }, status: "DONE" });
    expect($roster.get().map((row) => row.id)).toEqual(["a1", "a3"]);
    expect(loudest($roster.get())).toBe("PAUSED");
    expect(loudest([])).toBe("NONE");
    expect([settled("DONE"), settled("RUNNING")]).toEqual([true, false]);
    const sent = new Set();
    expect(owed("SIGTERM", $roster.get(), sent).map((row) => row.id)).toEqual(["a1"]);
    expect(owed("SIGTERM", $roster.get(), sent)).toEqual([]);
  });

  it("an activity's stdin and stdout ride /userspace/entities/activity/<id> on the dataspace's runtime rung", async () => {
    const { entities, log, ready } = world();
    await ready;
    const activity = await entities.activity.merge({ id: "a1", thread: "t1", status: "RUNNING" });
    expect(Object.keys(activity.stdin)).toEqual(["SIGTERM", "SIGSTOP", "SIGCONT", "SIGKILL"]);
    await activity.stdin.SIGTERM({ reason: "test" });
    expect(log.at(-1)).toEqual({ path: "/userspace/entities/activity/a1/stdin/SIGTERM", body: { reason: "test" } });
    const records = [];
    for await (const record of await activity.stdout()) records.push(record);
    expect(records).toEqual([{ verb: "open" }]);
    expect(log.at(-1)).toEqual({ path: "/userspace/entities/activity/a1/stdout", body: {}, method: "POST" });
    expect(Object.keys(activity.toJSON()).some((key) => key.startsWith("$") || key === "stdin" || key === "stdout")).toBe(false);
  });
});
