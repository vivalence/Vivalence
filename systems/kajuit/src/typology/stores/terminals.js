import { atom } from "nanostores";
import { random } from "@vivalence/typology";
import { Terminal } from "../entities/terminal.js";

const STORAGE_KEY = "viva.terminals";
const ACTIVE_KEY = "viva.terminals.active";

export class Terminals {
  $entities = atom(
    (JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []).map((data) => new Terminal(data)),
  );
  $active = atom(
    this.$entities.get().find((terminal) => terminal.id === localStorage.getItem(ACTIVE_KEY)),
  );

  constructor() {
    this.$entities.subscribe((entities) =>
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entities.map((terminal) => terminal.toJSON())),
      ),
    );
    this.$active.subscribe((terminal) =>
      terminal
        ? localStorage.setItem(ACTIVE_KEY, terminal.id)
        : localStorage.removeItem(ACTIVE_KEY),
    );
  }

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
    const terminal = new Terminal({ id: random.id() });
    this.$entities.set([terminal, ...this.$entities.get()]);
    this.$active.set(terminal);
    return terminal;
  }

  activate(id) {
    this.$active.set(this.entities.find((terminal) => terminal.id === id));
  }

  remove(id) {
    this.$entities.set(this.entities.filter((terminal) => terminal.id !== id));
    if (this.active?.id === id) this.$active.set(this.$entities.get().at(-1));
  }
}

export async function rehydrate(terminals, lighthouse) {
  const daemons = lighthouse.$daemons.get();
  for (const terminal of terminals.entities) {
    if (typeof terminal.thread !== "string") continue;
    for (const daemon of daemons) {
      if (!daemon?.entities?.thread) continue;
      const thread = await daemon.entities.thread.findOne(
        { id: terminal.thread },
        { populate: ["mode", "intent"] },
      );
      if (!thread) continue;
      daemon.entities.thread.resolve?.(thread);
      terminal.thread = thread;
      break;
    }
  }
}
