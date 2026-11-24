import { types } from "@mikro-orm/core";
import { MikroORM } from "@mikro-orm/sqlite";
import { Path } from "@vivalence/typology";
import { Paladin, FULL, lifecycle } from "@vivalence/paladin/typology";
import {
  VirtualEntity,
  VirtualRepository,
  VirtualSchema,
} from "../../../subsystems/typology/entities/base/VirtualEntity.ts";

class LockEntity extends VirtualEntity {
  instance;
  pid;
  status;
  processes = [];
}

const LockSchema = new VirtualSchema({
  class: LockEntity,
  properties: {
    instance: { type: types.string },
    pid: { type: types.integer },
    status: { type: types.string },
    processes: { type: types.json },
  },
});

class Locks extends VirtualRepository {
  constructor(em, name, paladin) {
    super(em, name);
    this.paladin = paladin;
  }
  mount(slug) {
    return this.paladin.scope.ledger.branch(`/locks/${slug}.lock`);
  }
  async refill() {
    const home = this.paladin.scope.ledger.branch("locks");
    const files = await this.paladin.find.walk(/\.lock$/)(home, 0).catch(() => []);
    const held = await Promise.all(files.map((file) => this.paladin.read.json(file)));
    this.$entities.set(held.map((lock) => this.em.create(LockEntity, lock, { persist: false })));
  }
  async find(where = {}) {
    await this.refill();
    return super.find(where);
  }
  async findOne(where = {}) {
    await this.refill();
    return super.findOne(where);
  }
  async upsert(data) {
    const lock = await super.upsert({ ...data, id: data.instance });
    await this.paladin.state.json(this.mount(lock.instance), lock.toObject());
    return lock;
  }
  async removeOne(where) {
    const lock = await super.removeOne(where);
    await this.paladin.state.remove(this.mount(lock.instance));
    return lock;
  }
}

const root = await Deno.makeTempDir({ prefix: "virtual-locks-probe-" });
const paladin = lifecycle.paladin.belt(new Paladin(), FULL);
paladin.scopes([["ledger", () => true, () => new Path(root)]]);
const orm = await MikroORM.init({ dbName: ":memory:", entities: [LockSchema] });
const locks = new Locks(orm.em.fork(), LockEntity, paladin);

await locks.upsert({ instance: "alive", pid: Deno.pid, status: "ALIVE", processes: [] });
console.log("file", await paladin.read.json(locks.mount("alive")));
const other = { id: "other", instance: "other", pid: 1, status: "SPAWNED", processes: [] };
await paladin.state.json(locks.mount("other"), other);
console.log("find sees another writer", (await locks.find()).map((lock) => lock.instance).sort());
console.log("find { status }", (await locks.find({ status: "SPAWNED" })).map((lock) => lock.id));
await locks.upsert({ instance: "alive", pid: Deno.pid, status: "STOPPING", processes: [] });
console.log("after update", (await locks.findOne({ instance: "alive" })).status);
await locks.removeOne({ instance: "alive" });
console.log("after remove", (await locks.find()).map((lock) => lock.instance));

const started = performance.now();
for (let turn = 0; turn < 200; turn++) await locks.findOne({ instance: "other" });
console.log("findOne ms each", ((performance.now() - started) / 200).toFixed(3));
await orm.close();
await Deno.remove(root, { recursive: true });
