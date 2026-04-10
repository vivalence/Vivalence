import { atom } from "nanostores";
import { object } from "@vivalence/typology";

export class LocalRepository {
  constructor(options = {}) {
    this.kind = options.kind ?? null;
    this.storageKey = options.persist ?? null;
    this.identities = new Map();
    this.$entities = atom([]);
    this.counter = 0;

    if (this.storageKey) this.hydrate();
  }

  // ── queries ──────────────────────────────────────────────────────

  find(where = {}) {
    const all = this.$entities.get();
    if (!Object.keys(where).length) return all;
    return all.filter(entity => object.match(entity, where));
  }

  findOne(where = {}) {
    return this.$entities.get().find(entity => object.match(entity, where)) ?? null;
  }

  has(id) {
    return this.identities.has(id);
  }

  count(where = {}) {
    return this.find(where).length;
  }

  // ── mutations ────────────────────────────────────────────────────

  create(data = {}) {
    const id = data.id ?? this.generateId();
    const entity = this.kind
      ? Object.assign(new this.kind(), { ...data, id })
      : { ...data, id };
    this.identities.set(id, entity);
    this.$entities.set([...this.$entities.get(), entity]);
    this.store();
    return entity;
  }

  merge(raw) {
    if (!raw?.id) return raw;
    const existing = this.identities.get(raw.id);
    if (existing) {
      for (const field of Object.keys(raw)) {
        if (raw[field] === undefined) continue;
        existing[field] = raw[field];
      }
      this.refresh();
      this.store();
      return existing;
    }
    return this.create(raw);
  }

  update(id, patch) {
    const entity = this.identities.get(id);
    if (!entity) return null;
    for (const [field, value] of Object.entries(patch)) {
      entity[field] = value;
    }
    this.refresh();
    this.store();
    return entity;
  }

  remove(id) {
    this.identities.delete(id);
    this.$entities.set(this.$entities.get().filter(entity => entity.id !== id));
    this.store();
  }

  drop(id) {
    this.remove(id);
  }

  clear() {
    this.identities.clear();
    this.$entities.set([]);
    this.store();
  }

  // ── iteration ────────────────────────────────────────────────────

  all() {
    return this.$entities.get();
  }

  values() {
    return this.identities.values();
  }

  get size() {
    return this.identities.size;
  }

  // ── persistence ──────────────────────────────────────────────────

  hydrate() {
    if (!this.storageKey) return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        for (const raw of JSON.parse(stored)) this.create(raw);
      }
    } catch {}
  }

  store() {
    if (!this.storageKey) return;
    try {
      const entities = this.$entities.get().map(entity =>
        entity.toJSON ? entity.toJSON() : { ...entity },
      );
      localStorage.setItem(this.storageKey, JSON.stringify(entities));
    } catch {}
  }

  // ── internals ────────────────────────────────────────────────────

  generateId() {
    return "l" + (++this.counter) + "_" + Date.now().toString(36);
  }

  refresh() {
    this.$entities.set([...this.$entities.get()]);
  }
}
