import { computed, atom } from "nanostores";
import { Stall } from "./stall.js";

// export const TerminalPhaseEnum = {STREAM: "STREAM", CHAT: "CHAT", FEED: "FEED",};

export class Terminal {
  stall = new Stall();
  $phase = atom("STREAM");
  $perspective = atom(null);

  $daemon = atom(null);
  $mode = atom(null);
  $session = atom(null);
  $valence = atom(null);

  get daemon() {
    return this.$daemon.get();
  }
  set daemon(v) {
    this.$daemon.set(v);
  }
  get mode() {
    return this.$mode.get();
  }
  set mode(v) {
    this.$mode.set(v);
  }
  get session() {
    return this.$session.get();
  }
  set session(v) {
    this.$session.set(v);
  }
  get valence() {
    return this.$valence.get();
  }
  set valence(v) {
    this.$valence.set(v);
  }
  get phase() {
    return this.$phase.get();
  }
  set phase(v) {
    this.$phase.set(v);
  }
  get perspective() {
    return this.$perspective.get();
  }
  set perspective(v) {
    this.$perspective.set(v);
  }
  reset() {
    this.stall.reset();
    this.$valence.set(null);
    this.$mode.set(null);
    this.$daemon.set(null);
    this.$session.set(null);
    this.$perspective.set(null);
  }

  toJSON() {
    return {
      phase: this.$phase.get(),
      perspective: this.$perspective.get(),
      daemon: this.$daemon.get()?.slug ?? null,
      mode: this.$mode.get()?.slug ?? null,
      session: this.$session.get()?.id ?? null,
      valence: this.$valence.get()?.slug ?? null,
      stall: this.stall.toJSON(),
    };
  }
}
