import { atom } from "nanostores";
import { assertEquals } from "jsr:@std/assert";
import { Terminal } from "../src/typology/entities/terminal.js";

// a buffer double with the release hook the stall bridges through.
const buf = (id) => {
  const hooks = [];
  return { id, on: { release: (cb) => hooks.push(cb) }, done: () => hooks.forEach((h) => h()) };
};

// a thread double: the atoms + trait the terminal reads to build its stall. The stall's pull
// goes through ThreadTraits.aimed.pull → thread.mode.connection.call → daemon.buffer.merge,
// so a continuous thread wires those; a manual one needs none of it.
const thread = (buffers, { phase = "manual", depth = 1 } = {}) => {
  const $buffers = atom(buffers);
  const $phase = atom(phase);
  const dropped = [];
  return {
    id: "t1",
    $buffers,
    $phase,
    trait: { QUEUEING: { depth } },
    dropped,
    daemon: {
      entities: {
        buffer: {
          drop: (id) => dropped.push(id),
          removeOne: () => Promise.resolve(),
          merge: (pojo) => {
            const b = buf(pojo.id);
            $buffers.set([...$buffers.get(), b]);
            return b;
          },
        },
      },
    },
  };
};

Deno.test("terminal builds a stall from the thread; phase drives terminal.$buffer", async () => {
  const [a, b] = [buf("a"), buf("b")];
  const t = thread([a, b]); // manual
  const terminal = new Terminal({ id: "term" });
  terminal.thread = t;

  // MANUAL — settle auto-focuses the first buffer (the old a-panel $effect, now the stall).
  assertEquals(terminal.buffer.id, "a");

  // release advances the cursor AND the terminal's on.release hook evicts (drop called).
  a.done();
  assertEquals(terminal.buffer.id, "b");
  assertEquals(t.dropped, ["a"]);

  // INERT — a deliberate null is respected; no auto-focus, release no-ops through the stall.
  t.$phase.set("inert");
  terminal.$buffer.set(null);
  t.$buffers.set([b]); // a tick
  assertEquals(terminal.buffer, null);
});

Deno.test("continuous: the stall pulls via AIMED to keep depth filled", async () => {
  const t = thread([], { phase: "inert", depth: 2 });
  let pulls = 0;
  t.trait.AIMED = { mount: "/emit/x" };
  t.mode = {
    connection: {
      call: async () => {
        pulls++;
        return {
          kind: "emission",
          condition: "NOMINAL",
          entities: { buffer: [{ id: "p" + pulls }] },
        };
      },
    },
  };
  const terminal = new Terminal({ id: "term2" });
  terminal.thread = t;

  t.$phase.set("continuous"); // engage → one pull (guard prevents a stampede)
  await Promise.resolve();
  await Promise.resolve();
  assertEquals(pulls, 1);
  assertEquals(t.$buffers.get().length, 1); // the pull (via AIMED) merged one buffer
});
