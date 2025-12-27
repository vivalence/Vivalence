import { atom, computed, map } from "nanostores";

export class Repository {
  // log, json,
  listeners = { create: [] };
  constructor(entity) {
    this.entity = entity;
    this.$entities = atom([]);
    this.$has = computed(this.$entities, (e) => e.length > 0);
  }

  get has() {
    return this.$has.get();
  }

  // spawn, add, expect, create, ...
  async spawn(args) {
    let entity;
    if (args instanceof this.entity.prototype) entity = args;
    else entity = new this.entity.prototype(args);
    if (this.entity.lifecycle) await this.entity.lifecycle(entity);
    this.add(entity);

    return entity;
  }

  async expect(args) {
    let entity = this.find(args);
    if (!entity) entity = await this.spawn(args);
    return entity;
  }

  async findOne(match) {
    for (const entity of this.$entities.get()) {
      const is = await match(entity); // why async?
      if (is) return entity;
    }
    return null;
  }

  add(entity) {
    this.$entities.set([...this.$entities.get(), entity]);
    this.listeners.create.forEach((listener) => listener(entity));
  }

  onCreate(listener) {
    this.listeners.create.push(listener);
  }
}
