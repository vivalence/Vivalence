import { atom } from "nanostores";
import { object } from "@vivalence/typology";

export class RemoteRepository {
  $entities = atom([]);
  _schema = {};

  constructor(prototype) {
    this._prototype = prototype;
  }

  connect(connection) {
    this._connection = connection;
    return this;
  }

  async find(where = {}, options = {}) {
    if (!this._connection) {
      return this.$entities.get().filter((e) => object.match(e, where));
    }
    const results = await this._connection.call("/find", { where, options });
    return results.map((raw) => this._hydrate(raw));
  }

  findOneLocal(where = {}) {
    return this.$entities.get().find((e) => object.match(e, where)) ?? null;
  }

  async findOne(where = {}, options = {}) {
    const local = this.findOneLocal(where);
    if (local) return local;
    if (!this._connection) return null;
    const result = await this._connection.call("/findOne", { where, options });
    return result ? this._hydrate(result) : null;
  }

  async findAndCount(where = {}, options = {}) {
    const [entities, count] = await this._connection.call("/findAndCount", { where, options });
    return [entities.map((raw) => this._hydrate(raw)), count];
  }

  async count(where = {}, options = {}) {
    return this._connection.call("/count", { where, options });
  }

  async create(data = {}) {
    if (!this._connection) return this.merge(data);
    const result = await this._connection.call("/create", { data });
    return this.merge(result);
  }

  async upsert(data = {}) {
    const result = await this._connection.call("/upsert", { data });
    return this.merge(result);
  }

  async ensure(data = {}) {
    const result = await this._connection.call("/ensure", { data });
    return this.merge(result);
  }

  async updateOne(where = {}, data = {}) {
    const result = await this._connection.call("/updateOne", { where, data });
    return this.merge(result);
  }

  async update(where = {}, data = {}) {
    const results = await this._connection.call("/update", { where, data });
    return results.map((r) => this.merge(r));
  }

  async removeOne(where = {}) {
    if (this._connection) {
      await this._connection.call("/removeOne", { where });
    }
    if (where.id) this._drop(where.id);
  }

  async remove(where = {}) {
    if (this._connection) {
      const { ids } = await this._connection.call("/remove", { where });
      for (const id of ids) this._drop(id);
    }
  }

  subscribe(where = {}) {
    if (!this._connection) return () => {};
    const controller = new AbortController();
    const repo = this;

    (async () => {
      try {
        for await (const event of repo._connection.subscribe("/subscribe", {
          signal: controller.signal,
          headers: { "x-filter": JSON.stringify(where) },
        })) {
          if (event.op === "delete") {
            repo._drop(event.entity?.id ?? event.entity);
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

  merge(raw) {
    if (!raw) return null;
    const entity = this._prototype ? new this._prototype(raw) : raw;
    const result = this._upsert(entity);
    if (this.resolve) this.resolve(result);
    return result;
  }

  _hydrate(raw) {
    const props = this._schema?.properties;
    if (props) {
      // console.log({ props, raw });
      for (const [key, spec] of Object.entries(props)) {
        if (!spec.target || raw[key] == null) {
          // console.log("SKIPPING WIRE", key, spec, raw);
          continue;
        }
        const sibling = this._schema._stores?.[spec.target];
        if (!sibling) continue;
        if (spec.kind === "m:1" && typeof raw[key] === "object") {
          raw[key] = sibling.merge(raw[key]);
        }
        if ((spec.kind === "1:m" || spec.kind === "m:n") && Array.isArray(raw[key])) {
          raw[key] = raw[key].map((item) =>
            typeof item === "object" ? sibling.merge(item) : item,
          );
        }
      }
    }
    return this.merge(raw);
  }

  _upsert(entity) {
    const all = this.$entities.get();
    const idx = all.findIndex((e) => e.id === entity.id);
    if (idx >= 0) {
      const existing = all[idx];
      for (const key of Object.keys(entity)) {
        const incoming = entity[key];
        if (incoming === undefined) continue;
        const current = existing[key];
        if (
          Array.isArray(incoming) &&
          incoming.length === 0 &&
          Array.isArray(current) &&
          current.length > 0
        )
          continue;
        existing[key] = incoming;
      }
      this.$entities.set([...all]);
      return existing;
    }
    this.$entities.set([...all, entity]);
    return entity;
  }

  _drop(id) {
    this.$entities.set(this.$entities.get().filter((e) => e.id !== id));
  }
}
