import { atom } from "nanostores";
import { Stall, Blacklist, RemoteRepository } from "@vivalence/typology";
import { logger } from "$telemetry";
import { Entity } from "../prototypes/entity.js";
import { pull } from "./thread/traits/aimed.js";
import { depth } from "./thread/traits/queueing.js";
import { defaultDock } from "../stores/bridge/dock.js";

const DOCK_DEBOUNCE_MS = 250;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export class Terminal extends Entity {
  id = null;
  identity = null;
  daemon = null;
  thread = null;
  index = 0;
  traits = [];
  trait = {};

  $thread = atom(null);
  $buffer = atom(null);
  $dock = atom(defaultDock());
  $settling = atom(null);
  stall = null;
  repository = null;
  docking = null;
  derivedDock = null;

  get label() {
    return this.trait.LABELED?.name ?? null;
  }
  get dock() {
    return this.$dock.get();
  }
  get settling() {
    return this.$settling.get();
  }

  toJSON() {
    const kept = (key) => !key.startsWith("$") && !["stall", "repository", "docking", "derivedDock"].includes(key);
    return Object.fromEntries(Object.entries(super.toJSON()).filter(([key]) => kept(key)));
  }

  write(data) {
    return this.repository
      .updateOne({ id: this.id }, data)
      .catch((error) => logger.entry(`terminals/write/${this.id}`).fault(error));
  }

  seat(thread) {
    return this.write({ daemon: thread?.daemon?.id ?? null, thread: thread?.id ?? null });
  }

  persistDock() {
    clearTimeout(this.docking);
    this.docking = setTimeout(() => {
      const value = this.$dock.get();
      if (same(value, this.trait.DOCKED) || same(value, this.derivedDock)) return;
      const traits = this.traits.includes("DOCKED") ? this.traits : [...this.traits, "DOCKED"];
      this.write({ traits, trait: { ...this.trait, DOCKED: value } });
    }, DOCK_DEBOUNCE_MS);
  }

}

export function mountSeat(terminal, identity) {
  let bound = null;
  let unbind = [];
  terminal.$dock.listen(() => terminal.persistDock());

  const bind = (daemon) => {
    if (daemon === bound) return;
    unbind.forEach((off) => off());
    bound = daemon;
    unbind = daemon
      ? [daemon.entities?.thread?.$entities.listen(derive), daemon.status?.$transient?.listen(derive)].filter(Boolean)
      : [];
  };

  const derive = () => {
    const docked = terminal.trait.DOCKED ?? identity?.trait?.DOCKED;
    terminal.derivedDock = docked ?? null;
    if (docked && !same(docked, terminal.$dock.get())) terminal.$dock.set({ ...docked });

    const daemon = terminal.daemon;
    bind(daemon);
    const id = terminal.thread;
    if (!id) {
      terminal.$settling.set(null);
      if (terminal.$thread.get()) terminal.$thread.set(null);
      return;
    }
    const store = daemon?.entities?.thread;
    if (!daemon?.status?.is?.("healthy") || !store) {
      terminal.$settling.set({ thread: id });
      if (terminal.$thread.get()) terminal.$thread.set(null);
      return;
    }
    const found = store.findOneLocal({ id });
    terminal.$settling.set(null);
    if (found) {
      if (terminal.$thread.get() !== found) terminal.$thread.set(found);
      return;
    }
    if (terminal.$thread.get()) terminal.$thread.set(null);
    logger.entry("terminal/unseat").note({ terminal: terminal.id, thread: id, daemon: daemon.slug });
    terminal.write({ daemon: null, thread: null });
  };

  const offRows = terminal.repository.$entities.listen(derive);
  derive();
  return () => {
    offRows();
    unbind.forEach((off) => off());
  };
}

export function mountStall(terminal) {
  let threadVigil = null;
  let bufferVigil = null;

  const vigil = (entity, repository, clear) =>
    repository?.$entities?.listen((entities) => {
      if (!entities.some((candidate) => candidate.id === entity.id)) clear();
    }) ?? null;

  terminal.$buffer.subscribe((buffer) => {
    bufferVigil?.();
    bufferVigil = buffer ? vigil(buffer, terminal.$thread.get()?.daemon?.entities?.buffer, () => terminal.$buffer.set(null)) : null;
  });

  let seated = null;
  terminal.$thread.subscribe((thread) => {
    if ((thread?.id ?? null) !== seated) terminal.$buffer.set(null);
    seated = thread?.id ?? null;
    threadVigil?.();
    threadVigil = thread ? vigil(thread, thread.daemon?.entities?.thread, () => terminal.$thread.set(null)) : null;
    terminal.stall?.deactivate();
    terminal.stall =
      thread &&
      Stall({
        source: thread.$buffers,
        active: terminal.$buffer,
        phase: thread.$phase,
        pull: () => pull(thread, { blacklist: new Blacklist().absorb(thread.$buffers.get()) }),
        depth: () => depth(thread),
      });
    terminal.stall?.on.release((buffer) => {
      thread.daemon.entities.buffer.drop(buffer.id);
      thread.daemon.entities.buffer
        .removeOne({ id: buffer.id })
        .catch((error) => logger.entry(`buffers/release/${buffer.id}`).fault(error));
    });
  });
}

export const TerminalDossier = {
  name: "terminal",
  kind: () => Terminal,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/entities/terminal"));
    return repo;
  },
  use: [
    async (ctx, next) => {
      await next();
      const terminal = ctx.entity;
      if (terminal.repository) return;
      terminal.repository = ctx.repository;
      mountStall(terminal);
      mountSeat(terminal, ctx.lighthouse.identity);
    },
  ],
};
