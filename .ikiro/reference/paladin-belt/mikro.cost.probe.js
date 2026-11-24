const t0 = performance.now();
await import("@vivalence/paladin/typology");
const t1 = performance.now();
const core = await import("@mikro-orm/core");
const { MikroORM } = await import("@mikro-orm/sqlite");
const t2 = performance.now();
const virtual = await import("../../../subsystems/typology/entities/base/VirtualEntity.ts");
class LockEntity extends virtual.VirtualEntity {
  instance;
  pid;
}
const schema = new virtual.VirtualSchema({
  class: LockEntity,
  properties: { instance: { type: core.types.string }, pid: { type: core.types.integer } },
});
const orm = await MikroORM.init({ dbName: ":memory:", entities: [schema] });
const t3 = performance.now();
const locks = new virtual.VirtualRepository(orm.em.fork(), LockEntity);
await locks.create({ instance: "alive", pid: Deno.pid });
console.log("findOne", (await locks.findOne({ instance: "alive" })).instance);
const t4 = performance.now();
console.log({
  "paladin typology import ms": Math.round(t1 - t0),
  "mikro core + sqlite import ms": Math.round(t2 - t1),
  "orm init ms": Math.round(t3 - t2),
  "first create + findOne ms": Math.round(t4 - t3),
});
await orm.close();
