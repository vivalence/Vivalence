import { atom } from "nanostores";
import { random } from "@vivalence/typology";
import { Terminal } from "../entities/terminal.js";

const STORAGE_KEY = "viva.terminals";
const ACTIVE_KEY = "viva.terminals.active";

export class Terminals {
  $entities = atom([]);
  $active = atom(null);

  get entities() {
    return this.$entities.get();
  }
  get active() {
    return this.$active.get();
  }
  set active(terminal) {
    this.$active.set(terminal);
  }

  create() {
    const terminal = Terminal({ id: random.id() });
    this.$entities.set([terminal, ...this.$entities.get()]);
    this.$active.set(terminal);
    return terminal;
  }

  activate(id) {
    this.$active.set(this.entities.find((terminal) => terminal.id === id));
  }

  remove(id) {
    this.$entities.set(this.entities.filter((terminal) => terminal.id !== id));
    if (this.active?.id === id) this.$active.set(this.$entities.get().at(-1) ?? null);
  }
}

// resolve persisted terminals → live entities, publish, THEN arm persistence. The atoms are
// null-or-entity for the writer's whole life: a thread/buffer id is resolved here BEFORE it
// reaches the atom, and the write subscription is armed only after — so it never serializes
// (and no consumer, the Stall, ever reads) a wire-format id. No per-entity seed needed.
export async function rehydrate(terminals, lighthouse) {
  const daemons = lighthouse.$daemons.get();

  // Restore a persisted id-string to its live, resolved entity (or null if gone).
  const restore = async (entityName, id, options) => {
    for (const daemon of daemons) {
      const repository = daemon?.entities?.[entityName];
      if (!repository) continue;
      const entity = await repository.findOne({ id }, options);
      if (!entity) continue;
      repository.resolve?.(entity);
      return entity;
    }
    return null;
  };

  const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  const entities = [];
  for (const data of persisted) {
    const terminal = Terminal({ id: data.id });
    if (data.thread)
      terminal.thread = await restore("thread", data.thread, { populate: ["mode", "intent"] });
    if (data.buffer) terminal.buffer = await restore("buffer", data.buffer);
    entities.push(terminal);
  }

  terminals.$entities.set(entities);
  terminals.$active.set(
    entities.find((terminal) => terminal.id === localStorage.getItem(ACTIVE_KEY)) ?? null,
  );

  arm(terminals);
}

// persist on any change to the set OR to a terminal's thread/buffer. The thread/buffer live
// in inner atoms, so watching $entities alone misses selection changes — re-arm the inner
// subscriptions whenever the set changes.
function arm(terminals) {
  const write = () =>
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(terminals.entities.map((terminal) => terminal.toJSON())),
    );
  let inner = [];
  terminals.$entities.subscribe((entities) => {
    inner.forEach((unsubscribe) => unsubscribe());
    inner = entities.flatMap((terminal) => [
      terminal.$thread.subscribe(write),
      terminal.$buffer.subscribe(write),
    ]);
    write();
  });
  terminals.$active.subscribe((terminal) =>
    terminal
      ? localStorage.setItem(ACTIVE_KEY, terminal.id)
      : localStorage.removeItem(ACTIVE_KEY),
  );
}
