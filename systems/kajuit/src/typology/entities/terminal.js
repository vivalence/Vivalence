import { atom } from "nanostores";
import { Stall, Blacklist } from "@vivalence/typology";
import { logger } from "$telemetry";
import { pull } from "./thread/traits/aimed.js";
import { depth } from "./thread/traits/queueing.js";
import { defaultDock } from "../stores/bridge/dock.js";

export function Terminal({ id = null, dock } = {}) {
  const $thread = atom(null);
  const $buffer = atom(null);
  // const $view = atom(null;) //@beef!
  const $dock = atom(dock ?? defaultDock());
  let stall = null;

  let threadVigil = null;
  let bufferVigil = null;

  const vigil = (entity, repository, clear) =>
    repository?.$entities?.listen((entities) => {
      if (!entities.some((candidate) => candidate.id === entity.id)) clear();
    }) ?? null;

  const terminal = {
    id,
    $thread,
    $buffer,
    $dock,

    get thread() {
      return $thread.get();
    },
    set thread(value) {
      if (($thread.get()?.id ?? null) !== (value?.id ?? null)) $buffer.set(null);
      // console.log(`[probe] terminal ${id} thread mount ${value?.id ?? "null"} (daemon ${value?.daemon?.slug ?? "-"})`,);
      $thread.set(value);
    },

    get buffer() {
      return $buffer.get();
    },
    set buffer(value) {
      $buffer.set(value);
    },

    get dock() {
      return $dock.get();
    },

    get daemon() {
      return $thread.get()?.daemon;
    },
    get stall() {
      return stall;
    },

    toJSON: () => ({
      id,
      thread: $thread.get()?.id ?? null,
      buffer: $buffer.get()?.id ?? null,
      dock: $dock.get(),
    }),
  };

  // the stall re-builds on every thread switch: source = its buffers, active = our pointer,
  // phase = the thread's knob, pull = AIMED.pull (a free capability read live — no stamped
  // method to go stale), depth = QUEUEING.depth. The thread owns config; the stall reacts.
  $buffer.subscribe((buffer) => {
    bufferVigil?.();
    bufferVigil = buffer
      ? vigil(buffer, $thread.get()?.daemon?.entities?.buffer, () => $buffer.set(null))
      : null;
  });

  $thread.subscribe((thread) => {
    threadVigil?.();
    threadVigil = thread
      ? vigil(thread, thread.daemon?.entities?.thread, () => (terminal.thread = null))
      : null;
    stall?.deactivate();
    stall =
      thread &&
      Stall({
        source: thread.$buffers,
        active: $buffer,
        phase: thread.$phase,
        pull: () => pull(thread, { blacklist: new Blacklist().absorb(thread.$buffers.get()) }),
        depth: () => depth(thread),
      });
    stall?.on.release((buffer) => {
      thread.daemon.entities.buffer.drop(buffer.id); // optimistic: source shrinks now
      thread.daemon.entities.buffer
        .removeOne({ id: buffer.id }) // server sync
        .catch((error) => logger.entry(`buffers/release/${buffer.id}`).fault(error));
    });
  });

  return terminal;
}
