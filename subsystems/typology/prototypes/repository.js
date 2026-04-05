import { object } from "@vivalence/typology";

export class RemoteRepository {
  schema = {};

  constructor(kind) {
    this.kind = kind;
  }

  connect(connection) {
    this.connection = connection;
    return this;
  }

  // Bind this repository to a RemoteEntityManager.
  // The EM owns the identity map and reactive store.
  manage(entityManager, name) {
    this.entityManager = entityManager;
    this.managedName = name;
    this.$entities = entityManager.stores[name];
    return this;
  }

  persist() {
    this.persisted = true;
    this.storageKey = this.connection.url.absolute;
    const repo = this;
    this.encode = (entities) => {
      const props = repo.schema?.properties ?? {};
      return JSON.stringify(entities, function (k, v) {
        if (typeof v === "function") return undefined;
        if (v instanceof Set || v instanceof Map) return undefined;
        const spec = props[k];
        if (spec) {
          if (spec.kind === "m:1") return v?.id ? { id: v.id } : v;
          if (spec.kind === "1:m" || spec.kind === "m:n") {
            return Array.isArray(v) ? v.map((e) => (e?.id ? { id: e.id } : e)) : v;
          }
        }
        if (v != null && typeof v === "object" && !Array.isArray(v) && v.constructor !== Object) {
          return undefined;
        }
        return v;
      });
    };
    const existing = this.$entities.get();
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        for (const raw of JSON.parse(stored)) this.merge(raw);
      } catch {}
    }
    if (existing.length > 0) {
      for (const raw of existing) this.merge(raw);
    }
    return this;
  }

  // ── queries ──────────────────────────────────────────────────────

  async find(where = {}, options = {}) {
    const local = this.$entities.get();
    if (this.persisted && local.length > 0) {
      this.revalidating = this.connection
        .call("/find", { where, options })
        .then((fresh) => {
          const freshIds = new Set(fresh.map((r) => r.id));
          for (const e of this.$entities.get()) {
            if (!freshIds.has(e.id)) this.drop(e.id);
          }
          fresh.forEach((raw) => this.cast(raw));
        })
        .catch((e) => console.error("[repo] revalidate", e));
      return local.filter((e) => object.match(e, where)).map((e) => this.cast(e));
    }
    const results = await this.connection.call("/find", { where, options });
    return results.map((raw) => this.cast(raw));
  }

  findOneLocal(where = {}) {
    return this.$entities.get().find((e) => object.match(e, where)) ?? null;
  }

  async findOne(where = {}, options = {}) {
    const local = this.findOneLocal(where);
    if (local) return local;
    const result = await this.connection.call("/findOne", { where, options });
    return result ? this.cast(result) : null;
  }

  async findAndCount(where = {}, options = {}) {
    const [entities, count] = await this.connection.call("/findAndCount", { where, options });
    return [entities.map((raw) => this.cast(raw)), count];
  }

  async count(where = {}, options = {}) {
    return this.connection.call("/count", { where, options });
  }

  // ── mutations ────────────────────────────────────────────────────

  async create(data = {}) {
    const result = await this.connection.call("/create", { data });
    return this.merge(result);
  }

  async upsert(data = {}) {
    const result = await this.connection.call("/upsert", { data });
    return this.merge(result);
  }

  async ensure(data = {}) {
    const result = await this.connection.call("/ensure", { data });
    return this.merge(result);
  }

  async updateOne(where = {}, data = {}) {
    const result = await this.connection.call("/updateOne", { where, data });
    return this.merge(result);
  }

  async update(where = {}, data = {}) {
    const results = await this.connection.call("/update", { where, data });
    return results.map((r) => this.merge(r));
  }

  async removeOne(where = {}) {
    await this.connection.call("/removeOne", { where });
    if (where.id) this.drop(where.id);
  }

  async remove(where = {}) {
    const { ids } = await this.connection.call("/remove", { where });
    for (const id of ids) this.drop(id);
  }

  // ── subscription ─────────────────────────────────────────────────

  subscribe(where = {}) {
    const controller = new AbortController();
    const repo = this;

    (async () => {
      try {
        for await (const event of repo.connection.subscribe("/subscribe", {
          signal: controller.signal,
          headers: { "x-filter": JSON.stringify(where) },
        })) {
          if (event.op === "delete") {
            repo.drop(event.entity?.id ?? event.entity);
          } else {
            repo.merge(event.entity);
          }
        }
      } catch (e) {
        if (e.name !== "AbortError") throw e;
      }
    })();

    return function unsubscribe() {
      controller.abort();
    };
  }

  // ── identity (delegated to EM) ───────────────────────────────────

  merge(raw) {
    if (!raw) return null;
    const result = this.entityManager.merge(this.managedName, raw, this.kind);
    if (this.resolve) this.resolve(result);
    this.store();
    return result;
  }

  cast(raw) {
    const result = this.entityManager.cast(this.managedName, raw, this.kind);
    if (this.resolve) this.resolve(result);
    this.store();
    return result;
  }

  drop(id) {
    this.entityManager.drop(this.managedName, id);
    this.store();
  }

  store() {
    if (!this.storageKey) return;
    try {
      localStorage.setItem(this.storageKey, this.encode(this.$entities.get()));
    } catch {}
  }

  // ── legacy ───────────────────────────────────────────────────────
  // put() was the old standalone identity path.
  // Commented out — all identity goes through EM now.
  //
  // put(entity) {
  //   const all = this.$entities.get();
  //   const idx = all.findIndex((e) => e.id === entity.id);
  //   if (idx >= 0) {
  //     const existing = all[idx];
  //     for (const key of Object.keys(entity)) {
  //       const incoming = entity[key];
  //       if (incoming === undefined) continue;
  //       const current = existing[key];
  //       if (Array.isArray(incoming) && incoming.length === 0 && Array.isArray(current) && current.length > 0) continue;
  //       existing[key] = incoming;
  //     }
  //     this.$entities.set([...all]);
  //     this.store();
  //     return existing;
  //   }
  //   const next = [...all, entity];
  //   this.$entities.set(next);
  //   this.store();
  //   return entity;
  // }
}
