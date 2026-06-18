import { atom, computed } from "nanostores";

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

    // Registered repos + their compiled integrators.
    this.repositoryMap = {};
    this.integrators = {};

    // (name:id) keys whose integrator has already run. Claimed synchronously
    // at the top of integrate() so that nested/concurrent integrates on the
    // same id dedupe the install even when cast() does awaited resolution
    // of back-referencing children.
    this.installed = new Set();
  }

  // ── repository access ────────────────────────────────────────────

  repo(name) {
    if (this.repositoryMap[name]) return this.repositoryMap[name];
    throw new Error(`No repository registered for: ${name}`);
  }

  // Register an existing RemoteRepository to be managed by this EM.
  // Optional integrate fn: runs once per (name, id) on first sight.
  register(name, repository, integrate = null) {
    if (!this.stores[name]) this.stores[name] = atom([]);
    repository.manage(this, name);
    this.repositoryMap[name] = repository;
    this.integrators[name] = integrate;
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

    const props = this.schema[name]?.properties;
    const mapKey = this.key(name, raw.id);
    const existing = this.identities.get(mapKey);

    if (existing) {
      for (const field of Object.keys(raw)) {
        let incoming = raw[field];
        if (incoming === undefined) continue;
        const spec = props?.[field];
        if (spec?.target && incoming != null) {
          if (spec.kind === "m:1") {
            const id = typeof incoming === "object" ? incoming.id : incoming;
            incoming = this.identity(spec.target, id) ?? (existing[field]?.id === id ? existing[field] : incoming);
          } else if ((spec.kind === "1:m" || spec.kind === "m:n") && Array.isArray(incoming)) {
            incoming = incoming.map((item) => this.identity(spec.target, item) ?? item);
          }
        }
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

  // Identity-gated install. Install runs exactly once per (name, id):
  // first-sight passes through cast (relation walk) then runs the registered
  // integrator. Re-sight is just cast. The claim is synchronous so a nested
  // integrate on the same id (e.g. a child back-referencing its parent)
  // observes the parent as already-installed and does not re-fire.
  async integrate(name, raw, kind) {
    if (!raw?.id) return raw;
    const mapKey = this.key(name, raw.id);
    if (this.installed.has(mapKey)) return this.merge(name, raw, kind);
    this.installed.add(mapKey);
    try {
      const entity = await this.cast(name, raw, kind);
      const install = this.integrators[name];
      if (install) await install(entity, raw);
      return entity;
    } catch (error) {
      this.installed.delete(mapKey);
      throw error;
    }
  }

  async disintegrate(name, id) {
    this.drop(name, id);
  }

  async resolve(name, reference) {
    if (reference == null) return null;
    if (typeof reference === "string") return this.identity(name, reference) ?? reference;
    if (reference.id) {
      const repository = this.repositoryMap[name];
      if (!repository) return reference;
      return await repository.merge(reference);
    }
    return reference;
  }

  async cast(name, raw, kind) {
    const props = this.schema[name]?.properties;

    // Resolve relation refs into a fresh payload BEFORE merging. The reactive
    // store only ever sees fully-upgraded entity references, so any computed
    // filters fire on the final shape — not on pre-resolution string ids.
    const resolved = props ? { ...raw } : raw;
    if (props) {
      for (const [field, spec] of Object.entries(props)) {
        if (!spec.target || raw[field] == null) continue;
        if (spec.kind === "m:1") {
          resolved[field] = await this.resolve(spec.target, raw[field]);
        }
        if ((spec.kind === "1:m" || spec.kind === "m:n") && Array.isArray(raw[field])) {
          resolved[field] = await Promise.all(raw[field].map((item) => this.resolve(spec.target, item)));
        }
      }
    }

    const entity = this.merge(name, resolved, kind);
    if (!props) return entity;

    for (const [field, spec] of Object.entries(props)) {
      if (spec.kind !== "1:m" || !spec.mappedBy) continue;
      const childRepo = this.repositoryMap[spec.target];
      if (!childRepo) continue;
      const mappedBy = spec.mappedBy;
      const hadExplicitArray = Array.isArray(resolved[field]);

      // When the parent cast received an explicit children array, enforce
      // the inverse on each child so the reactive collection agrees with
      // the explicit intake.
      if (hadExplicitArray) {
        for (const child of resolved[field]) {
          if (child && typeof child === "object" && child[mappedBy] !== entity) {
            child[mappedBy] = entity;
          }
        }
        this.refreshStore(spec.target);
      }

      if (!entity["$" + field]) {
        entity["$" + field] = computed(childRepo.$entities, (entities) =>
          entities.filter((child) =>
            child[mappedBy] === entity ||
            child[mappedBy]?.id === entity.id ||
            child[mappedBy] === entity.id,
          ),
        );
      }

      // Only route reads through the computed when the parent wasn't seeded
      // with an explicit array — otherwise preserve the direct assignment
      // merge() just made from `resolved[field]`.
      if (!hadExplicitArray) {
        Object.defineProperty(entity, field, {
          get() { return entity["$" + field].get(); },
          set() {},
          configurable: true,
        });
      }
    }
    return entity;
  }

  drop(name, id) {
    const mapKey = this.key(name, id);
    this.identities.delete(mapKey);
    this.snapshots.delete(mapKey);
    this.installed.delete(mapKey);
    if (this.stores[name]) {
      this.stores[name].set(this.stores[name].get().filter((entity) => entity.id !== id));
    }
  }

  // ── unit of work ─────────────────────────────────────────────────

  persist(entity) {
    this.removed.delete(entity);
    this.dirty.add(entity);
    const { name } = this.repositoryForEntity(entity);
    if (name) this.refreshStore(name);
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
