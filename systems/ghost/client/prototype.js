import { atom } from "nanostores";
import { Vector, fromm } from "@vivalence/typology";
import * as shard from "../gestalten/shard/index.js";

export class Client {
  controller = null;
  mask = null;
  register = null;
  instance = null;
  surface = null;
  unmount = null;
  booted = null;
  modes = {};
  repl = new Vector();
  runtime = null;
  $active = atom(null);

  constructor(client) {
    Object.assign(this, client);
  }

  get active() {
    return this.$active.get();
  }

  dispatch(line) {
    return shard.repl.dispatch(this, this.active, line);
  }

  get json() {
    return { mask: this.mask, modes: fromm.modes(this.modes).flat.map((mode) => mode.reference.absolute), terminal: this.active === null ? null : this.active.id };
  }
}
