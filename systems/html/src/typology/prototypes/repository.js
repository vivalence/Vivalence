import { atom, computed, map } from "nanostores";
import { is, object } from "@vivalence/typology";

export class Repository {
  $entities = atom([]);

  constructor(entity) {
    this.entity = entity;
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
    return results.map((e) => this.add(e));
  }

  async findOne(where = {}, options = {}) {
    let result = this.$entities.get().find((e) => object.match(e, where)) ?? null;
    if (!result && this._connection) {
      result = await this._connection.call("/findOne", { where, options });
    }
    return result ? this.add(result) : null;
  }

  add(entity) {
    return this._merge(
      entity instanceof this.entity.prototype ? entity : new this.entity.prototype(entity),
    );
  }

  async create(data = {}) {
    if (!this._connection) return this.add(data);
    const result = await this._connection.call("/create", { data });
    return this.add(result);
  }
  async update(id, data = {}) {
    const result = await this._connection.call("/update", { where: { id }, data });
    return this.add(result);
  }
  async remove(id) {
    if (this._connection) await this._connection.call("/remove", { where: { id } });
    this._drop(id);
  }

  _merge(entity) {
    const all = this.$entities.get();
    const idx = all.findIndex((e) => e.id === entity.id);
    if (idx >= 0) {
      Object.assign(all[idx], entity);
      this.$entities.set([...all]);
      return all[idx];
    }
    this.$entities.set([...all, entity]);
    return entity;
  }
  _drop(id) {
    this.$entities.set(this.$entities.get().filter((e) => e.id !== id));
  }

  async spawn(args) {
    // depracated
    let entity;
    if (args instanceof this.entity.prototype) entity = args;
    else entity = new this.entity.prototype(args);
    if (this.entity.lifecycle) await this.entity.lifecycle(entity);

    this.add(entity);
    return entity;
  }

  async expect(args) {
    // depracated
    let entity = this.find(args);
    if (!entity) entity = await this.spawn(args);
    return entity;
  }

  toJSON() {
    const entities = this.$entities.get();
    return {
      type: this.entity?.prototype?.name ?? null,
      connected: !!this._connection,
      count: entities.length,
      entities: entities.map((e) => e?.toJSON?.() ?? { id: e?.id, slug: e?.slug }),
    };
  }
  // onCreate(listener) {this.listeners.create.push(listener);}
  // this.listeners.create.forEach((listener) => listener(entity));

  // subscribe(url, $authority) {this._unsub?.() const ctrl = new AbortController() const read = async () => {const auth = $authority?.get() const res = await fetch(url, {headers: auth?.access ? { Authorization: `Bearer ${auth.access}` } : {}, signal: ctrl.signal, credentials: "include",}) const reader = res.body.getReader() const decoder = new TextDecoder() let buf = "" while (true) {const { done, value } = await reader.read() if (done) break buf += decoder.decode(value, { stream: true }) const parts = buf.split("\n\n") buf = parts.pop() for (const part of parts) {const line = part.replace(/^data: /, "").trim() if (!line || line.startsWith(":")) continue for (const { op, entity } of JSON.parse(line)) op === "delete" ? this._drop(entity.id) : this._merge(entity)}}} read().catch(() => {}) this._unsub = () => ctrl.abort() return this._unsub}
}
