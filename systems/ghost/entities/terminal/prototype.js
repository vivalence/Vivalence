import { atom } from "nanostores";
import { Entity, RemoteRepository, Vector, is } from "@vivalence/typology";
import * as shard from "../../gestalten/shard/index.js";

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
  repl = new Vector();
  $thread = atom(null);
  $buffer = atom(null);

  get thread() {
    return this.$thread.get();
  }
  set thread(value) {
    this.$thread.set(value);
  }
  get label() {
    return this.trait.LABELED === undefined ? null : this.trait.LABELED.name;
  }
  get mode() {
    return this.thread === null ? null : this.thread.mode;
  }
  get buffer() {
    return this.$buffer.get();
  }

  toJSON() {
    const kept = (key) => !key.startsWith("$") && !["client", "repository", "runtime", "daemon", "controller", "repl"].includes(key);
    const base = Object.fromEntries(Object.entries(super.toJSON()).filter(([key]) => kept(key)));
    const daemon = this.daemon === null || is.string(this.daemon) ? this.daemon : this.daemon.id;
    const thread = this.thread === null ? null : this.thread.id;
    return { ...base, daemon, thread };
  }

  dispatch(signal) {
    return shard.repl.dispatch(this.client, this, signal);
  }

  write(data) {
    return this.repository.updateOne({ id: this.id }, data);
  }

  setThread(thread) {
    if (thread === null) return this.write({ daemon: null, thread: null });
    if (is.string(thread.mode)) return Promise.reject(new Error(`${thread.id}: its mode ${thread.mode} belongs to a host that is not mounted`));
    const daemon = thread.mode === null || thread.mode.daemon === null ? null : thread.mode.daemon.id;
    return this.write({ daemon, thread: thread.id });
  }
}

export const repository = (dataspace) => new RemoteRepository(Terminal).connect(dataspace.runtime.connection.branch("/userspace/entities/terminal"));

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.client = ctx.client;
  ctx.entity.runtime = ctx.runtime;
  ctx.entity.repository = ctx.repository;
});
