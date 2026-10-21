import { atom } from "nanostores";
import { Entity, is } from "@vivalence/typology";
import * as belt from "../../gestalten/belt/index.js";
import { Legend } from "./legend.js";
import { Repl } from "./repl.js";
import { Stall } from "./stall.js";

export class Terminal extends Entity {
  id = null;
  user = null;
  daemon = null;
  index = 0;
  traits = [];
  trait = {};

  client = null;
  runtime = null;
  repository = null;
  controller = null;
  repl = new Repl(this);
  legend = new Legend(this);
  stall = new Stall(this);
  $thread = atom(null);
  $buffer = atom(null);

  get thread() {
    return this.$thread.get();
  }
  set thread(value) {
    this.$thread.set(value);
  }
  get word() {
    return this.thread.word;
  }
  get mode() {
    return this.thread === null ? null : this.thread.mode;
  }
  get buffer() {
    return this.$buffer.get();
  }
  get dock() {
    return { ...belt.dock.DEFAULT_DOCK, ...this.client.mask.trait.DOCKED, ...this.client.runtime.lighthouse.user.trait.DOCKED, ...this.trait.DOCKED };
  }

  toJSON() {
    const kept = (key) => !key.startsWith("$") && !["client", "repository", "runtime", "daemon", "controller", "repl", "legend", "stall"].includes(key);
    const base = Object.fromEntries(Object.entries(super.toJSON()).filter(([key]) => kept(key)));
    const daemon = this.daemon === null || is.string(this.daemon) ? this.daemon : this.daemon.id;
    const thread = this.thread === null ? null : this.thread.id;
    return { ...base, daemon, thread };
  }

  setThread(thread) {
    if (thread === null) return this.repository.updateOne({ id: this.id }, { daemon: null, thread: null });
    if (is.string(thread.mode)) return Promise.reject(new Error(`${thread.id}: its mode ${thread.mode} belongs to a host that is not mounted`));
    const daemon = thread.mode === null || thread.mode.daemon === null ? null : thread.mode.daemon.id;
    return this.repository.updateOne({ id: this.id }, { daemon, thread: thread.id });
  }
}
