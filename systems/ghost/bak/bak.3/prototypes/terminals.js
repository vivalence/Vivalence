import { atom } from "nanostores";
import { is } from "@vivalence/typology";

export class Terminals {
  $active = atom(null);

  constructor(runtime) {
    this.runtime = runtime;
  }

  get $entities() {
    return this.runtime.entities.terminal.$entities;
  }
  get entities() {
    return this.$entities.get();
  }
  get active() {
    return this.$active.get();
  }

  create(data = {}) {
    return this.runtime.entities.terminal.create(data);
  }

  activate(terminal) {
    const held = is.string(terminal) ? this.entities.find((row) => row.id === terminal) : terminal;
    if (held === undefined) throw new Error(`${terminal}: no such terminal`);
    this.$active.set(held);
    return held;
  }

  remove(terminal) {
    if (this.active === terminal) this.$active.set(null);
    return this.runtime.entities.terminal.removeOne({ id: terminal.id });
  }
}
