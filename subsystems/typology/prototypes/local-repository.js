import { atom } from "nanostores";
import { object } from "@vivalence/typology";

export class LocalRepository {
  integrate = null;

  constructor(options = {}) {
    this.kind = options.kind ?? null;
    this.storageKey = options.persist ?? null;
    this.identities = new Map();
    this.$entities = atom([]);
    this.counter = 0;
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

  async cast(raw) {
    if (!raw) return null;
    const id = raw.id ?? this.generateId();
    const existing = this.identities.get(id);
    const entity = existing ?? (this.kind
      ? Object.assign(new this.kind(), { ...raw, id })
      : { ...raw, id });
    if (!existing) {
      this.identities.set(id, entity);
      this.$entities.set([...this.$entities.get(), entity]);
      if (this.integrate) await this.integrate(entity, raw);
    }
    this.refresh();
    this.store();
    return entity;
  }

  async create(data = {}) {
    return this.cast(data);
  }

  async merge(raw) {
    if (!raw?.id) return this.cast(raw);
    const existing = this.identities.get(raw.id);
    if (!existing) return this.cast(raw);
    for (const field of Object.keys(raw)) {
      if (raw[field] === undefined) continue;
      existing[field] = raw[field];
    }
    this.refresh();
    this.store();
    return existing;
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

  restore() {
    if (!this.storageKey) return Promise.resolve();
    let rawList = null;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) rawList = JSON.parse(stored);
    } catch {}
    if (!rawList) return Promise.resolve();

    const pending = [];
    for (const raw of rawList) {
      if (!raw?.id || this.identities.has(raw.id)) continue;
      const entity = this.kind
        ? Object.assign(new this.kind(), { ...raw })
        : { ...raw };
      this.identities.set(raw.id, entity);
      this.$entities.set([...this.$entities.get(), entity]);
      pending.push({ entity, raw });
    }

    if (!this.integrate) return Promise.resolve();
    return (async () => {
      for (const { entity, raw } of pending) await this.integrate(entity, raw);
    })();
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
