import { atom } from "nanostores";
import { fromm } from "@vivalence/typology";

const WORDS = ["lighthouse", "runtime", "daemons", "userspace", "terminals", "dispatch"];
const ATOMS = ["seat", "live", "echo", "slot", "chord", "standing"];

export class Client {
  mask = null;
  lighthouse = null;
  root = null;
  runtime = null;
  daemons = {};
  userspace = null;
  terminals = null;
  dispatch = null;
  panes = null;

  $seat = atom(null);
  $live = atom(null);
  $echo = atom(null);
  $slot = atom(null);
  $chord = atom(null);
  $standing = atom({ code: "IDLE" });
  $terminal = atom(null);
  $modes = atom([]);

  constructor({ mask }) {
    this.mask = mask;
    this.words = Object.create(null);
    for (const word of WORDS)
      Object.defineProperty(this.words, word, { get: () => this[word], enumerable: true });
    for (const word of ATOMS)
      Object.defineProperty(this.words, word, { get: () => this[`$${word}`], enumerable: true });
  }

  get seat() {
    return this.$seat.get();
  }
  get live() {
    return this.$live.get();
  }
  get echo() {
    return this.$echo.get();
  }
  get slot() {
    return this.$slot.get();
  }
  get chord() {
    return this.$chord.get();
  }
  get standing() {
    return this.$standing.get();
  }
  get terminal() {
    return this.$terminal.get();
  }

  get bearers() {
    return [this.runtime, ...Object.values(this.daemons)].filter((bearer) => bearer !== null);
  }

  get modes() {
    const flat = this.$modes.get();
    return {
      flat,
      at: (reference) => flat.find((mode) => mode.reference.absolute === reference) ?? null,
      byId: (id) => flat.find((mode) => mode.id === id) ?? null,
    };
  }

  gather() {
    this.$modes.set(this.bearers.flatMap((bearer) => fromm.modes(bearer.modes).flat));
    return this.$modes.get();
  }

  get json() {
    return {
      client: this.mask.manifest,
      standing: this.standing,
      user: this.lighthouse ? this.lighthouse.user : null,
      runtime: this.runtime ? this.runtime.toJSON() : null,
      daemons: Object.fromEntries(
        Object.entries(this.daemons).map(([reference, daemon]) => [reference, daemon.toJSON()]),
      ),
      seat: this.seat
        ? {
            terminal: this.seat.terminal.id,
            thread: this.seat.thread ? this.seat.thread.id : null,
            mode: this.seat.mode ? this.seat.mode.reference : null,
          }
        : null,
    };
  }

  toJSON() {
    return this.json;
  }
}
