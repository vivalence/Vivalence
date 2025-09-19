import { atom, computed, map } from "nanostores";

export class Repository {
  listeners = { create: [] };
  constructor(prototype, lifecycle) {
    this.entity = { prototype, lifecycle };
    this.$entities = atom([]);
  }

  // spawn, add, expect, create, ...
  async spawn(args) {
    const entity = new this.entity.prototype(args);
    if (this.entity.lifecycle) await this.entity.lifecycle(entity);
    this.add(entity);
    return entity;
  }

  add(entity) {
    this.$entities.set([...this.$entities.get(), entity]);
    this.listeners.create.forEach((listener) => listener(entity));
  }

  onCreate(listener) {
    this.listeners.create.push(listener);
  }
}
