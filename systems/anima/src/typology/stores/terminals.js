import { atom } from "nanostores";
import { random } from "@vivalence/typology";
import { Terminal } from "../entities/terminal.js";

// membership + active pointer only. Hydration, persistence and serialized-reference
// settlement are effects mounted over this structure from the app layer
// (src/app/terminals.js) — the store knows nothing of storage, daemons or lighthouse.
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
