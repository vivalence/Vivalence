import { LocalRepository } from "@vivalence/typology";
import { atom, computed } from "nanostores";
import { Terminal } from "./terminal.js";

const ACTIVE_KEY = "viva.quarters.active";

export class Quarters {
  constructor() {
    this.terminals = new LocalRepository({ kind: Terminal, persist: "viva.quarters" });
    this.$active = atom(restoreActive(this.terminals));
    this.$terminal = computed(this.$active, (id) => (id ? this.terminals.findOne({ id }) : null));
  }

  spawn(slug = null) {
    const terminal = this.terminals.create({ slug });
    this.$active.set(terminal.id);
    persistActive(terminal.id);
    return terminal;
  }

  activate(id) {
    if (this.terminals.has(id)) {
      this.$active.set(id);
      persistActive(id);
    }
  }

  close(id) {
    this.terminals.remove(id);
    if (this.$active.get() === id) {
      const remaining = this.terminals.all();
      this.$active.set(remaining.length ? remaining.at(-1).id : null);
      persistActive(this.$active.get());
    }
  }
}

function restoreActive(terminals) {
  try {
    const stored = localStorage.getItem(ACTIVE_KEY);
    if (stored && terminals.has(stored)) return stored;
  } catch {}
  const all = terminals.all();
  return all.length ? all[0].id : null;
}

function persistActive(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}
