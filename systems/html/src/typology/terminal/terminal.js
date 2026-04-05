import { atom } from "nanostores";
import { Stall } from "./stall.js";

export class Terminal {
  stall = new Stall();
  $phase = atom("STREAM");

  $daemon = atom(null);
  $mode = atom(null);
  $thread = atom(null);
  $intent = atom(null);

  get daemon() { return this.$daemon.get(); }
  set daemon(v) { this.$daemon.set(v); }
  get mode() { return this.$mode.get(); }
  set mode(v) { this.$mode.set(v); }
  get thread() { return this.$thread.get(); }
  set thread(v) { this.$thread.set(v); }
  get intent() { return this.$intent.get(); }
  set intent(v) { this.$intent.set(v); }
  get phase() { return this.$phase.get(); }
  set phase(v) { this.$phase.set(v); }

  reset() {
    this.stall.reset();
    this.$intent.set(null);
    this.$mode.set(null);
    this.$daemon.set(null);
    this.$thread.set(null);
  }

  toJSON() {
    return {
      phase: this.$phase.get(),
      daemon: this.$daemon.get()?.slug ?? null,
      mode: this.$mode.get()?.slug ?? null,
      thread: this.$thread.get()?.id ?? null,
      intent: this.$intent.get()?.slug ?? null,
      stall: this.stall.toJSON(),
    };
  }
}
