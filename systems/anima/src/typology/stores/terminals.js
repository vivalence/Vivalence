import { atom, computed } from "nanostores";
import { logger } from "$telemetry";

export class Terminals {
  $active = atom(null);

  constructor(repository) {
    this.repository = repository;
    this.$entities = computed(repository.$entities, (entities) => [...entities].sort((a, b) => a.index - b.index));
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

  async create(seat = {}) {
    const terminal = await this.repository.create(seat);
    this.$active.set(terminal);
    return terminal;
  }

  settle(id) {
    if (this.active) return this.active;
    const seat = this.entities.find((terminal) => terminal.id === id) ?? this.entities[0] ?? null;
    this.$active.set(seat);
    return seat;
  }

  activate(id) {
    this.$active.set(this.entities.find((terminal) => terminal.id === id));
  }

  async remove(id) {
    if (this.active?.id === id) this.$active.set(this.entities.filter((terminal) => terminal.id !== id).at(-1) ?? null);
    this.repository.drop(id);
    await this.repository.removeOne({ id }).catch((error) => logger.entry(`terminals/remove/${id}`).fault(error));
  }
}
