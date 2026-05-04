import { atom, computed } from "nanostores";
import { Vector, shape, shard } from "@vivalence/typology";
import { TerminalDossier } from "../entities/terminal.js";

const ACTIVE_KEY = "viva.quarters.active";

function strategy(carry) {
  return async (entity, raw) => {
    const ctx = { entity, raw };
    await carry(ctx, async () => {});
    return entity;
  };
}

export class Quarters {
  constructor() {
    const dossier = TerminalDossier;
    const repository = dossier.repository(dossier, this);

    const vector = new Vector()
      .use(shard.context.attach("dossier", dossier))
      .use(shard.context.attach("repository", repository))
      .use(shard.context.attach("quarters", this));
    for (const fn of dossier.use ?? []) vector.use(fn);
    vector.affect(async () => {});
    repository.integrate = shape.selbstbestimmt(vector, strategy);

    this.terminals = repository;
    this.terminals.restore().catch(console.error);

    this.$active = atom(restoreActive(this.terminals));
    this.$terminal = computed(this.$active, (id) => (id ? this.terminals.findOne({ id }) : null));
  }

  get active() { return this.$active.get(); }
  get terminal() { return this.$terminal.get(); }

  async spawn(slug = null) {
    const terminal = await this.terminals.create({ slug });
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
