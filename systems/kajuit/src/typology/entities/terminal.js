import { atom } from "nanostores";
import { Stall, Blacklist } from "@vivalence/typology";
import { pull } from "./thread/traits/aimed.js";
import { depth } from "./thread/traits/queueing.js";
import { defaultDock } from "../stores/bridge/dock.js";

export function Terminal({ id = null, dock } = {}) {
  const $thread = atom(null);
  const $buffer = atom(null);
  // const $view = atom(null;) //@beef!
  const $dock = atom(dock ?? defaultDock());
  let stall = null;

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
  $thread.subscribe((thread) => {
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
        .catch((error) => console.warn(`[probe] release sync failed ${buffer.id}`, error));
    });
  });

  return terminal;
}
