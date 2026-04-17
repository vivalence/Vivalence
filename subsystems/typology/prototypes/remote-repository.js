import { object } from "@vivalence/typology";

export class RemoteRepository {
  schema = {};
  subscriptions = new Set();

  constructor(kind) {
    this.kind = kind;
  }

  connect(connection) {
    this.connection = connection;
    return this;
  }

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
        for (const raw of JSON.parse(stored)) this.entityManager.merge(this.managedName, raw, this.kind);
      } catch {}
    }
    if (existing.length > 0) {
      for (const raw of existing) this.entityManager.merge(this.managedName, raw, this.kind);
    }
    return this;
  }

  // ── queries ──────────────────────────────────────────────────────

  async find(where = {}, options = {}) {
    const local = this.$entities.get();
    if (this.persisted && local.length > 0) {
      this.revalidating = this.connection
        .call("/find", { where, options })
        .then(async (fresh) => {
          const freshIds = new Set(fresh.map((r) => r.id));
          for (const e of this.$entities.get()) {
            if (!freshIds.has(e.id)) this.drop(e.id);
          }
          await Promise.all(fresh.map((raw) => this.cast(raw)));
        })
        .catch((e) => console.error("[repo] revalidate", e));
      return Promise.all(local.filter((e) => object.match(e, where)).map((e) => this.cast(e)));
    }
    const results = await this.connection.call("/find", { where, options });
    return Promise.all(results.map((raw) => this.cast(raw)));
  }

  findOneLocal(where = {}) {
    return this.$entities.get().find((e) => object.match(e, where)) ?? null;
  }

  async findOne(where = {}, options = {}) {
    const local = this.findOneLocal(where);
    if (local) return local;
    const result = await this.connection.call("/findOne", { where, options });
    return result ? await this.cast(result) : null;
  }

  async findAndCount(where = {}, options = {}) {
    const [entities, count] = await this.connection.call("/findAndCount", { where, options });
    return [await Promise.all(entities.map((raw) => this.cast(raw))), count];
  }

  async count(where = {}, options = {}) {
    return this.connection.call("/count", { where, options });
  }

  // ── mutations ────────────────────────────────────────────────────

  async create(data = {}) {
    const result = await this.connection.call("/create", { data });
    return await this.merge(result);
  }

  async upsert(data = {}) {
    const result = await this.connection.call("/upsert", { data });
    return await this.merge(result);
  }

  async ensure(data = {}) {
    const result = await this.connection.call("/ensure", { data });
    return await this.merge(result);
  }

  async updateOne(where = {}, data = {}) {
    const result = await this.connection.call("/updateOne", { where, data });
    return await this.merge(result);
  }

  async update(where = {}, data = {}) {
    const results = await this.connection.call("/update", { where, data });
    return Promise.all(results.map((r) => this.merge(r)));
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

  subscribe(where = {}, callback) {
    const repo = this;
    const options = { headers: { "x-filter": JSON.stringify(where) } };

    const handle = async (event) => {
      if (event.op === "delete") {
        repo.drop(event.entity?.id ?? event.entity);
        if (callback) callback(null, event);
      } else {
        const merged = await repo.merge(event.entity);
        if (callback) callback(merged, event);
      }
    };

    const unsubscribe = this.connection.subscribe("/subscribe", handle, options);
    this.subscriptions.add(unsubscribe);
    const teardown = () => {
      unsubscribe();
      this.subscriptions.delete(unsubscribe);
    };
    return teardown;
  }

  // ── identity ─────────────────────────────────────────────────────

  async merge(raw) {
    if (!raw) return null;
    const result = await this.entityManager.integrate(this.managedName, raw, this.kind);
    this.store();
    return result;
  }

  async cast(raw) {
    return this.merge(raw);
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
}
