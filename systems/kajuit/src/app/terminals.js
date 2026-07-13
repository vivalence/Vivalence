import { Terminal } from "../typology/entities/terminal.js";

// Effects over the terminals structure, mounted from +layout — the scope that provides
// both TERMINALS and LIGHTHOUSE. Structure and entity stay pure; storage and network
// live here. Unresolved persisted references ride the `serialized` remainder in this
// module's closure — never on the terminal, never in an atom, so serialization is
// total (live entity id OR serialized id) and a write can never destroy a reference.

const STORAGE_KEY = "viva.terminals";
const ACTIVE_KEY = "viva.terminals.active";

const ABSENT = Symbol("absent");
const UNREACHABLE = Symbol("unreachable");

const serialized = new Map();

// storage → shells, published immediately; terminals paint before any daemon answers.
export function hydrate({ terminals }) {
  let persisted = [];
  try {
    persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  const shells = persisted.map((data) => {
    if (data.thread || data.buffer)
      serialized.set(data.id, { thread: data.thread ?? null, buffer: data.buffer ?? null });
    return Terminal({ id: data.id, dock: data.dock });
  });
  terminals.$entities.set(shells);
  terminals.$active.set(
    shells.find((shell) => shell.id === localStorage.getItem(ACTIVE_KEY)) ?? null,
  );
  console.log(`[probe] terminals hydrate — ${shells.length} shells, ${serialized.size} unresolved`);
}

// structure → storage, armed immediately and unconditionally — the fold is total,
// so outage writes carry unresolved ids forward instead of nulling them.
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
    console.log(`[probe] terminals write`, json);
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
    terminal
      ? localStorage.setItem(ACTIVE_KEY, terminal.id)
      : localStorage.removeItem(ACTIVE_KEY),
  );
  return () => {
    offEntities();
    offActive();
    inner.forEach((unsubscribe) => unsubscribe());
  };
}

// serialized ids → live entities, reactive over daemon availability. Tri-state:
// entity (assign + clear), ABSENT (a reachable daemon answered null everywhere —
// true deletion, clear), UNREACHABLE (any fault — keep, retry on next status flip).
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
        console.warn(`[probe] settle ${entityName} ${id} FAULT on ${daemon.slug}`, error);
        return UNREACHABLE;
      }
    }
    return reachable ? ABSENT : UNREACHABLE;
  };

  const pass = async () => {
    for (const terminal of terminals.entities) {
      const remainder = serialized.get(terminal.id);
      if (!remainder) continue;
      if (remainder.thread) {
        if (terminal.thread) {
          remainder.thread = null; // atom occupied: navigation won, late resolve yields
        } else {
          const outcome = await restore("thread", remainder.thread, {
            populate: ["mode", "intent"],
          });
          if (outcome !== UNREACHABLE) {
            console.log(
              `[probe] settle thread ${terminal.id} ${outcome === ABSENT ? "absent — dropped" : "resolved"}`,
            );
            if (outcome !== ABSENT) terminal.thread = outcome;
            remainder.thread = null;
          }
        }
      }
      // the thread setter clears $buffer on a switch — resolve the buffer only
      // once the thread reference is settled, never before.
      if (!remainder.thread && remainder.buffer) {
        if (terminal.buffer) {
          remainder.buffer = null;
        } else {
          const outcome = await restore("buffer", remainder.buffer);
          if (outcome !== UNREACHABLE) {
            console.log(
              `[probe] settle buffer ${terminal.id} ${outcome === ABSENT ? "absent — dropped" : "resolved"}`,
            );
            if (outcome !== ABSENT) terminal.buffer = outcome;
            remainder.buffer = null;
          }
        }
      }
      if (!remainder.thread && !remainder.buffer) serialized.delete(terminal.id);
    }
  };

  // one pass in flight; a status flip mid-pass queues exactly one follow-up.
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
