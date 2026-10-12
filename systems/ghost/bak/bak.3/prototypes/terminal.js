import { atom } from "nanostores";
import { Stall, Blacklist, RemoteRepository, is } from "@vivalence/typology";
import { Entity } from "./entity.js";
import * as aimed from "../traits/thread/aimed.js";
import * as queueing from "../traits/thread/queueing.js";

const noop = () => {};

export class Terminal extends Entity {
  id = null;
  user = null;
  daemon = null;
  index = 0;
  traits = [];
  trait = {};

  runtime = null;
  repository = null;
  stall = null;
  $repl = atom(null);
  $thread = atom(null);
  $buffer = atom(null);
  $error = atom(null);

  get repl() {
    return this.$repl.get();
  }
  get thread() {
    return this.$thread.get();
  }
  set thread(value) {
    this.$thread.set(value);
  }
  get label() {
    return this.trait.LABELED === undefined ? null : this.trait.LABELED.name;
  }
  get mask() {
    return this.runtime.mask;
  }
  get error() {
    return this.$error.get();
  }
  get mode() {
    return this.thread === null ? null : this.thread.mode;
  }
  get buffer() {
    return this.$buffer.get();
  }

  toJSON() {
    const kept = (key) => !key.startsWith("$") && !["stall", "repository", "runtime", "daemon"].includes(key);
    const base = Object.fromEntries(Object.entries(super.toJSON()).filter(([key]) => kept(key)));
    const daemon = this.daemon === null || is.string(this.daemon) ? this.daemon : this.daemon.id;
    const thread = this.thread === null ? null : this.thread.id;
    return { ...base, daemon, thread };
  }

  write(data) {
    return this.repository.updateOne({ id: this.id }, data);
  }

  seat(thread) {
    if (thread === null) return this.write({ daemon: null, thread: null });
    if (is.string(thread.mode)) return Promise.reject(new Error(`${thread.id}: its mode ${thread.mode} belongs to a host that is not mounted`));
    const daemon = thread.mode === null || thread.mode.daemon === null ? null : thread.mode.daemon.id;
    return this.write({ daemon, thread: thread.id });
  }
}

export function stall(terminal, entities) {
  let threadVigil = noop;
  let bufferVigil = noop;
  let seated = null;

  const vigil = (entity, repository, clear) =>
    repository.$entities.listen((rows) => {
      if (!rows.some((candidate) => candidate.id === entity.id)) clear();
    });

  const release = (buffer) => {
    entities.buffer.drop(buffer.id);
    entities.buffer.removeOne({ id: buffer.id }).catch((error) => terminal.$error.set(error));
  };

  const offBuffer = terminal.$buffer.subscribe((buffer) => {
    bufferVigil();
    bufferVigil = buffer ? vigil(buffer, entities.buffer, () => terminal.$buffer.set(null)) : noop;
  });

  const offThread = terminal.$thread.subscribe((thread) => {
    const id = thread ? thread.id : null;
    if (id !== seated) terminal.$buffer.set(null);
    seated = id;
    threadVigil();
    threadVigil = thread ? vigil(thread, entities.thread, () => terminal.$thread.set(null)) : noop;
    if (terminal.stall) terminal.stall.deactivate();
    terminal.stall = thread
      ? Stall({
          source: thread.$buffers,
          active: terminal.$buffer,
          phase: thread.$phase,
          pull: () => aimed.pull(thread, entities, { blacklist: new Blacklist().absorb(thread.$buffers.get()) }),
          depth: () => queueing.depth(thread),
        }).on.release(release)
      : null;
  });

  return () => {
    offBuffer();
    offThread();
    bufferVigil();
    threadVigil();
    if (terminal.stall) terminal.stall.deactivate();
    terminal.stall = null;
  };
}

export const TerminalDossier = {
  name: "terminal",
  kind: () => Terminal,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/terminal"));
    return repo;
  },
  use: [
    async (ctx, next) => {
      await next();
      ctx.entity.repository = ctx.repository;
      ctx.entity.runtime = ctx.runtime;
    },
  ],
};
