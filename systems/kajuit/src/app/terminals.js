import { logger } from "$telemetry";
import { Terminal } from "../typology/entities/terminal.js";

const STORAGE_KEY = "viva.terminals";
const ACTIVE_KEY = "viva.terminals.active";

const ABSENT = Symbol("absent");
const UNREACHABLE = Symbol("unreachable");

const named = (outcome) =>
  outcome === ABSENT ? "absent" : outcome === UNREACHABLE ? "unreachable" : "resolved";

const serialized = new Map();

export function hydrate({ terminals }) {
  const hydration = logger.entry("terminals").open();
  let persisted = [];
  try {
    persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    hydration.note({ message: "persisted terminals corrupt — discarded" });
    localStorage.removeItem(STORAGE_KEY);
  }
  const shells = persisted.map((data) => {
    if (data.thread || data.buffer)
      serialized.set(data.id, { thread: data.thread ?? null, buffer: data.buffer ?? null });
    return Terminal({ id: data.id, dock: data.dock });
  });
  terminals.$entities.set(shells);
  const active = shells.find((shell) => shell.id === localStorage.getItem(ACTIVE_KEY)) ?? null;
  terminals.$active.set(active);
  hydration.note({
    message: `${shells.length} terminal shell${shells.length === 1 ? "" : "s"} hydrated`,
    unresolved: serialized.size,
    active: active?.id ?? null,
  });
  hydration.close();
}

export function persist({ terminals }) {
  const write = () => {
    const json = JSON.stringify(
      terminals.entities.map((terminal) => {
        const live = terminal.toJSON();
        const remainder = serialized.get(terminal.id) ?? {};
        return {
          id: live.id,
          thread: live.thread ?? remainder.thread ?? null,
          buffer: live.buffer ?? remainder.buffer ?? null,
          dock: live.dock,
        };
      }),
    );
    // console.log(`[probe] terminals write`, json);
    localStorage.setItem(STORAGE_KEY, json);
  };
  let inner = [];
  const offEntities = terminals.$entities.subscribe((entities) => {
    inner.forEach((unsubscribe) => unsubscribe());
    inner = entities.flatMap((terminal) => [
      terminal.$thread.subscribe(write),
      terminal.$buffer.subscribe(write),
      terminal.$dock.subscribe(write),
    ]);
    write();
  });
  const offActive = terminals.$active.subscribe((terminal) =>
    terminal ? localStorage.setItem(ACTIVE_KEY, terminal.id) : localStorage.removeItem(ACTIVE_KEY),
  );
  return () => {
    offEntities();
    offActive();
    inner.forEach((unsubscribe) => unsubscribe());
  };
}

export function settle({ terminals, lighthouse }) {
  const restore = async (entityName, id, options) => {
    let reachable = false;
    for (const daemon of lighthouse.$daemons.get()) {
      if (!daemon.status.is("healthy")) continue;
      const repository = daemon?.entities?.[entityName];
      if (!repository) continue;
      try {
        const entity = await repository.findOne({ id }, options);
        reachable = true;
        if (entity) {
          repository.resolve?.(entity);
          return entity;
        }
      } catch (error) {
        logger.entry(`settle/${entityName}`).note({ id, daemon: daemon.slug }).fault(error);
        return UNREACHABLE;
      }
    }
    return reachable ? ABSENT : UNREACHABLE;
  };

  const pass = async () => {
    let settling = null;
    for (const terminal of terminals.entities) {
      const remainder = serialized.get(terminal.id);
      if (!remainder) continue;
      settling ??= logger.entry("settle").open();
      if (remainder.thread) {
        if (terminal.thread) {
          remainder.thread = null;
        } else {
          const outcome = await restore("thread", remainder.thread, {
            populate: ["mode", "intent"],
          });
          settling.note({
            message: `thread ${named(outcome)}`,
            terminal: terminal.id,
            thread: remainder.thread,
          });
          if (outcome !== UNREACHABLE) {
            if (outcome !== ABSENT) terminal.thread = outcome;
            remainder.thread = null;
          }
        }
      }
      if (!remainder.thread && remainder.buffer) {
        if (terminal.buffer) {
          remainder.buffer = null;
        } else {
          const outcome = await restore("buffer", remainder.buffer);
          settling.note({
            message: `buffer ${named(outcome)}`,
            terminal: terminal.id,
            buffer: remainder.buffer,
          });
          if (outcome !== UNREACHABLE) {
            if (outcome !== ABSENT) terminal.buffer = outcome;
            remainder.buffer = null;
          }
        }
      }
      if (!remainder.thread && !remainder.buffer) serialized.delete(terminal.id);
    }
    settling?.close();
  };

  let inflight = null;
  let queued = false;
  const attempt = () => {
    if (inflight) {
      queued = true;
      return inflight;
    }
    inflight = (async () => {
      do {
        queued = false;
        await pass();
      } while (queued);
      inflight = null;
    })();
    return inflight;
  };

  let statuses = [];
  const offDaemons = lighthouse.$daemons.subscribe((daemons) => {
    statuses.forEach((unsubscribe) => unsubscribe());
    statuses = daemons.map((daemon) => daemon.status.$transient.subscribe(() => attempt()));
    attempt();
  });
  return () => {
    offDaemons();
    statuses.forEach((unsubscribe) => unsubscribe());
  };
}
