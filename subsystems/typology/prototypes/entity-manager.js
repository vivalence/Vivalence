import { atom } from "nanostores";

// RemoteEntityManager — sits below repositories.
//
// Owns the identity map and unit of work.
// RemoteRepository delegates merge/put/drop to the EM when managed.
//
// Receives an authorized connection. Auth is a property of the connection.

export class RemoteEntityManager {
  constructor(connection, schema = {}) {
    this.connection = connection;
    this.schema = schema;

    // Identity map: all entity types, keyed by "name:id".
    this.identities = new Map();

    // Snapshots for dirty tracking.
    this.snapshots = new Map();

    // Reactive store per entity type.
    this.stores = {};

    // Unit of work.
    this.dirty = new Set();
    this.removed = new Set();

    // Registered repos.
    this.repositoryMap = {};
  }

  // ── repository access ────────────────────────────────────────────

  repo(name) {
    if (this.repositoryMap[name]) return this.repositoryMap[name];
    throw new Error(`No repository registered for: ${name}`);
  }

  // Register an existing RemoteRepository to be managed by this EM.
  register(name, repository) {
    if (!this.stores[name]) this.stores[name] = atom([]);
    repository.manage(this, name);
    this.repositoryMap[name] = repository;
    return repository;
  }

  // ── identity map ─────────────────────────────────────────────────

  key(name, id) { return `${name}:${id}`; }

  identity(name, reference) {
    if (!reference) return null;
    const id = typeof reference === "object" ? reference.id : reference;
    return this.identities.get(this.key(name, id)) ?? null;
  }

  // Merge raw data into identity map. Returns canonical entity reference.
  merge(name, raw, kind) {
    if (!raw?.id) return raw;

    const mapKey = this.key(name, raw.id);
    const existing = this.identities.get(mapKey);

    if (existing) {
      for (const field of Object.keys(raw)) {
        const incoming = raw[field];
        if (incoming === undefined) continue;
        if (Array.isArray(incoming) && incoming.length === 0 && Array.isArray(existing[field]) && existing[field].length > 0) continue;
        existing[field] = incoming;
      }
      this.refreshStore(name);
      this.snapshot(name, existing);
      return existing;
    }

    const entity = kind ? Object.assign(new kind(), raw) : raw;
    this.identities.set(mapKey, entity);
    this.stores[name].set([...this.stores[name].get(), entity]);
    this.snapshot(name, entity);
    return entity;
  }

  // Hydrate relationships via schema, then merge.
  async cast(name, raw, kind) {
    const props = this.schema[name]?.properties;
    if (props) {
      for (const [field, spec] of Object.entries(props)) {
        if (!spec.target || raw[field] == null) continue;
        const sibling = this.repositoryMap[spec.target];
        if (!sibling) continue;

        if (spec.kind === "m:1") {
          if (typeof raw[field] === "object" && raw[field].id) raw[field] = await sibling.merge(raw[field]);
          else if (typeof raw[field] === "string") raw[field] = this.identity(spec.target, raw[field]) ?? raw[field];
        }

        if ((spec.kind === "1:m" || spec.kind === "m:n") && Array.isArray(raw[field])) {
          raw[field] = await Promise.all(raw[field].map(async (item) => {
            if (typeof item === "object" && item.id) return await sibling.merge(item);
            if (typeof item === "string") return this.identity(spec.target, item) ?? item;
            return item;
          }));
        }
      }
    }
    return this.merge(name, raw, kind);
  }

  drop(name, id) {
    this.identities.delete(this.key(name, id));
    this.snapshots.delete(this.key(name, id));
    if (this.stores[name]) {
      this.stores[name].set(this.stores[name].get().filter((entity) => entity.id !== id));
    }
  }

  // ── unit of work ─────────────────────────────────────────────────

  persist(entity) {
    this.removed.delete(entity);
    this.dirty.add(entity);
  }

  remove(entity) {
    this.dirty.delete(entity);
    this.removed.add(entity);
  }

  async flush() {
    const operations = [];

    for (const entity of this.dirty) {
      const { name, repository } = this.repositoryForEntity(entity);
      if (!repository) continue;
      const diff = this.changes(name, entity);
      if (diff) {
        operations.push({
          path: `${repository.link.url.pathname}/updateOne`,
          body: { where: { id: entity.id }, data: diff },
          method: "POST",
        });
      }
    }

    for (const entity of this.removed) {
      const { name, repository } = this.repositoryForEntity(entity);
      if (!repository) continue;
      operations.push({
        path: `${repository.link.url.pathname}/removeOne`,
        body: { where: { id: entity.id } },
        method: "POST",
      });
    }

    if (operations.length) {
      await this.connection.call("/batch", operations);

      for (const entity of this.dirty) {
        const { name } = this.repositoryForEntity(entity);
        if (name) this.snapshot(name, entity);
      }

      for (const entity of this.removed) {
        const { name } = this.repositoryForEntity(entity);
        if (name) this.drop(name, entity.id);
      }
    }

    this.dirty.clear();
    this.removed.clear();
  }

  // ── snapshots ────────────────────────────────────────────────────

  snapshot(name, entity) {
    if (!entity?.id) return;
    try {
      const plain = entity.toJSON ? entity.toJSON() : { ...entity };
      this.snapshots.set(this.key(name, entity.id), structuredClone(plain));
    } catch {
      // Entity contains non-cloneable values (functions, closures).
      // Skip snapshot — dirty tracking won't work for this entity.
    }
  }

  changes(name, entity) {
    if (!entity?.id) return null;
    const original = this.snapshots.get(this.key(name, entity.id));
    if (!original) return null;

    const current = entity.toJSON ? entity.toJSON() : { ...entity };
    const diff = {};
    let hasDiff = false;

    for (const [field, value] of Object.entries(current)) {
      if (field === "id" || field === "createdAt" || field === "updatedAt") continue;
      if (JSON.stringify(value) !== JSON.stringify(original[field])) {
        diff[field] = value;
        hasDiff = true;
      }
    }
    return hasDiff ? diff : null;
  }

  // ── fork ─────────────────────────────────────────────────────────

  fork() {
    return new RemoteEntityManager(this.connection, this.schema);
  }

  // ── internals ────────────────────────────────────────────────────

  refreshStore(name) {
    if (this.stores[name]) {
      this.stores[name].set([...this.stores[name].get()]);
    }
  }

  repositoryForEntity(entity) {
    for (const [name, repository] of Object.entries(this.repositoryMap)) {
      if (repository.kind && entity instanceof repository.kind) return { name, repository };
    }
    for (const [name] of Object.entries(this.repositoryMap)) {
      if (this.identities.has(this.key(name, entity.id))) return { name, repository: this.repositoryMap[name] };
    }
    return { name: null, repository: null };
  }
}
