import { atom } from "nanostores";
import { specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";
import { hydration as threadHydration } from "../../../entities/thread/hydration.js";
import { hydration as bufferHydration } from "../../../entities/buffer/hydration.js";

const { describe, it, expect } = specimen;

const rig = async () => {
  const faults = [];
  const created = [];
  const runtime = { entities: {} };
  const hydrate = async (vector, entity) => vector.carry[0]({ entity, runtime }, async () => {});
  runtime.entities.thread = { $entities: atom([]) };
  runtime.entities.turn = { $entities: atom([]) };
  runtime.entities.activity = { $entities: atom([]) };
  runtime.entities.buffer = {
    $entities: atom([]),
    counter: 0,
    async create(data) {
      const buffer = Object.assign(new ghost.entities.buffer.Buffer(), { id: `b${this.counter}`, index: this.counter++, ...data, thread: runtime.entities.thread.$entities.get().find((thread) => thread.id === data.thread) });
      await hydrate(bufferHydration, buffer);
      created.push(data);
      this.$entities.set([...this.$entities.get(), buffer]);
      return buffer;
    },
    async removeOne(where) {
      this.$entities.set(this.$entities.get().filter((buffer) => buffer.id !== where.id));
    },
  };
  const thread = Object.assign(new ghost.entities.thread.Thread(), { id: "th1", mode: { id: "m1" }, phase: "manual" });
  await hydrate(threadHydration, thread);
  runtime.entities.thread.$entities.set([thread]);
  const terminal = Object.assign(new ghost.terminal.Terminal(), { id: "t1", client: { runtime }, controller: { stdout: { fault: (error) => faults.push(error) } } });
  const settle = async () => {
    let last;
    do {
      last = terminal.stall.refilling;
      await last;
    } while (last !== terminal.stall.refilling);
  };
  const stop = terminal.stall.watch();
  const seat = async () => {
    terminal.thread = thread;
    await settle();
  };
  return { runtime, thread, terminal, faults, created, settle, seat, stop };
};

describe("stall — the terminal keeps the seated thread's frame filled (m105 Q6K)", () => {
  it("an empty thread gets ONE blank buffer of its mode, and the frame holds it", async () => {
    const world = await rig();
    await world.seat();
    expect(world.created).toEqual([{ mode: "m1", thread: "th1", data: {} }]);
    expect(world.terminal.buffer).toBe(world.thread.$buffers.get()[0]);
    expect(world.faults).toEqual([]);
    world.stop();
  });

  it("a release removes the buffer on the runtime and frames the next one by index", async () => {
    const world = await rig();
    const later = await world.runtime.entities.buffer.create({ mode: "m1", thread: "th1", data: {} });
    const earlier = Object.assign(new ghost.entities.buffer.Buffer(), { id: "b-early", index: -1, mode: "m1", thread: world.thread });
    await bufferHydration.carry[0]({ entity: earlier, runtime: world.runtime }, async () => {});
    world.runtime.entities.buffer.$entities.set([later, earlier]);
    await world.seat();
    expect(world.terminal.buffer).toBe(earlier);
    earlier.release();
    await world.settle();
    expect(world.runtime.entities.buffer.$entities.get()).toEqual([later]);
    expect(world.terminal.buffer).toBe(later);
    world.stop();
  });

  it("a $phase change refills: a phase with no live branch faults on the terminal's span", async () => {
    const world = await rig();
    await world.seat();
    world.thread.phase = "continuous";
    world.runtime.entities.thread.$entities.set([world.thread]);
    await world.settle();
    expect(world.faults).toHaveLength(1);
    world.stop();
  });

  it("two quick refills both run — the chain drops neither", async () => {
    const world = await rig();
    await world.seat();
    world.thread.phase = "escort";
    world.runtime.entities.thread.$entities.set([world.thread]);
    await world.settle();
    world.terminal.stall.refill();
    world.terminal.stall.refill();
    await world.settle();
    expect(world.faults).toHaveLength(3);
    world.stop();
  });

  it("toJSON: unseated says so; seated names the thread, the phase, the frame and the buffers", async () => {
    const world = await rig();
    expect(world.terminal.stall.toJSON()).toEqual({ thread: null });
    await world.seat();
    expect(world.terminal.stall.toJSON()).toEqual({ thread: "th1", phase: "manual", buffer: "b0", buffers: ["b0"] });
    expect(JSON.parse(JSON.stringify(world.terminal)).stall).toBe(undefined);
    world.stop();
  });

  it("an unseated terminal stops watching — a buffer change after the thread leaves refills nothing", async () => {
    const world = await rig();
    await world.seat();
    world.terminal.thread = null;
    await world.runtime.entities.buffer.removeOne({ id: "b0" });
    await world.settle();
    expect(world.created).toHaveLength(1);
    world.stop();
  });

  it("watch() returns its off — after it, the seated thread's buffer change refills nothing", async () => {
    const world = await rig();
    await world.seat();
    world.stop();
    await world.runtime.entities.buffer.removeOne({ id: "b0" });
    await world.settle();
    expect([world.created.length, world.terminal.stall.$buffers.get()]).toEqual([1, []]);
  });
});
