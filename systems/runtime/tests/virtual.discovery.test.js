// m64 M0 — the discovery probe. TEMPORARY scaffold: every claim the virtual entity design leans on,
// measured in one in-memory init against mikro 6.6.7. Entity-agnostic (Host/Probe), touches no
// sets.* citizen. Reads only.
import { specimen, shard } from "@vivalence/typology";
import { MikroORM, EntitySchema, EntityRepository, RequestContext, types, BaseEntity, EventType } from "@mikro-orm/core";
import { VirtualRepository, VirtualSchema } from "@vivalence/runtime";
import { atom } from "nanostores";
import { config } from "../../../commons/datamaps/libsql/libsql.viva.js";

class HostEntity extends BaseEntity { id = crypto.randomUUID(); }
class ProbeEntity extends BaseEntity {
  id = crypto.randomUUID();
  status = "OPEN";
  #torn = false;
  get torn() { return this.#torn; }
  teardown() { this.#torn = true; }
}

const HostSchema = new EntitySchema({
  class: HostEntity, name: "Host", tableName: "Host",
  properties: {
    id: { type: types.string, primary: true },
    // hidden: a loaded inverse collection would serialize the PK-less probe as `null` on every Host
    // broadcast; hidden keeps it out of toObject while the strip still hands the client the 1:m.
    probes: { kind: "1:m", entity: () => ProbeEntity, mappedBy: (probe) => probe.host, hidden: true },
  },
});

// MEASURED: `virtual: true` alone is overwritten — EntityMetadata.sync() derives `virtual = !!expression`
// (core/typings.js:101). The only door is an expression; ours throws, because nothing may reach the driver.
const ProbeSchema = new EntitySchema({
  class: ProbeEntity, name: "Probe",
  expression: () => { throw new Error("Probe is served from its repository, never the driver"); },
  hooks: { beforeDelete: ["teardown"] },
  properties: {
    id: { type: types.string },
    status: { type: types.string },
    host: { kind: "m:1", entity: () => HostEntity, nullable: true },
  },
});

let orm, meta;
specimen.beforeAll(async () => {
  orm = await MikroORM.init({
    ...config({ dbName: ":memory:", entities: [HostSchema, ProbeSchema] }),
    allowGlobalContext: true,
  });
  await orm.schema.refreshDatabase();
  meta = orm.getMetadata().get(ProbeEntity);
});
specimen.afterAll(() => orm.close());

specimen.describe("m64 M0 — a virtual entity inside the graph", () => {
  specimen.it("metadata is keyed by CLASS name — `name:` is not the key", () => {
    specimen.expect(Object.keys(orm.getMetadata().getAll()).sort()).toEqual(["HostEntity", "ProbeEntity"]);
    specimen.expect(meta.virtual).toBe(true);
    specimen.expect(meta.primaryKeys).toEqual([]);
  });

  specimen.it("(a) a real 1:m may target a virtual entity — discovery holds", () => {
    specimen.expect(orm.getMetadata().get(HostEntity).properties.probes.targetMeta.className).toBe("ProbeEntity");
  });

  specimen.it("(b) a virtual m:1 hydrates to a real reference through em.create", () => {
    const host = orm.em.create(HostEntity, {});
    const probe = orm.em.create(ProbeEntity, { host: host.id });
    specimen.expect(probe.host.id).toBe(host.id);
    specimen.expect(probe).toBeInstanceOf(ProbeEntity);
    specimen.expect(probe.status).toBe("OPEN");
  });

  specimen.it("(c) no table: the create-schema SQL never names Probe", async () => {
    const sql = await orm.schema.getCreateSchemaSQL();
    specimen.expect(sql.toLowerCase()).toContain("host");
    specimen.expect(sql.toLowerCase()).not.toContain("probe");
  });

  specimen.it("(d) the strip carries probe AND host.probes (hidden or not) for the client", () => {
    const strip = shard.datamap.strip(orm.getMetadata());
    specimen.expect(strip.probe.properties.host).toEqual({ kind: "m:1", target: "host", owner: true, nullable: true });
    specimen.expect(strip.probe.columns.id).toEqual({ type: "string" });
    specimen.expect(strip.host.properties.probes).toEqual({ kind: "1:m", target: "probe", mappedBy: "host" });
  });

  specimen.it("(e) toObject: a COLD m:1 is its id, a LOADED m:1 expands — the repository normalizes, never the wire", () => {
    const host = orm.em.create(HostEntity, {});
    const warm = orm.em.create(ProbeEntity, { host: host.id });
    const cold = orm.em.fork().create(ProbeEntity, { host: host.id });
    specimen.expect(JSON.parse(JSON.stringify(cold)).host).toBe(host.id);
    specimen.expect(JSON.parse(JSON.stringify(warm)).host.id).toBe(host.id);
    specimen.expect(Object.keys(JSON.parse(JSON.stringify(cold))).sort()).toEqual(["host", "id", "status"]);
  });

  specimen.it("(e2) hidden keeps the PK-less inverse out of the Host wire", () => {
    const host = orm.em.create(HostEntity, {});
    orm.em.create(ProbeEntity, { host: host.id });
    specimen.expect("probes" in JSON.parse(JSON.stringify(host))).toBe(false);
  });

  specimen.it("(f) a hand-dispatched afterCreate reaches an all-entities subscriber", async () => {
    const seen = [];
    orm.em.getEventManager().registerSubscriber({
      getSubscribedEntities() { return []; },
      async afterCreate(args) { seen.push(args.meta?.className); },
    });
    const probe = orm.em.create(ProbeEntity, {});
    await orm.em.getEventManager().dispatchEvent(EventType.afterCreate, { entity: probe, em: orm.em, meta }, meta);
    specimen.expect(seen).toEqual(["ProbeEntity"]);
  });

  specimen.it("(g) a dispatched beforeDelete runs the schema hook on the instance", async () => {
    const probe = orm.em.create(ProbeEntity, {});
    await orm.em.getEventManager().dispatchEvent(EventType.beforeDelete, { entity: probe, em: orm.em, meta }, meta);
    specimen.expect(probe.torn).toBe(true);
  });

  specimen.it("(h) the instance is nobody's — no identity map registers it", () => {
    const probe = orm.em.create(ProbeEntity, {});
    specimen.expect([...orm.em.getUnitOfWork().getIdentityMap()].includes(probe)).toBe(false);
  });

  specimen.it("(i) a forked em mints a second repository instance — the storage must live on the class", () => {
    const root = orm.em.getRepository(ProbeEntity);
    const fork = orm.em.fork().getRepository(ProbeEntity);
    specimen.expect(fork).not.toBe(root);
    specimen.expect(fork.constructor).toBe(root.constructor);
  });
});

// ── the DataSchema mirror: an abstract VirtualSchema the citizen `extends:` — what mikro carries down.
// MetadataDiscovery.defineBaseEntityProperties (:756-794) copies props · filters · indexes · uniques ·
// checks · PKs · hooks; the source names neither `expression` nor `repository`. Measured here.
const throwing = () => { throw new Error("served from the repository, never the driver"); };
class BaseVirtualEntity extends BaseEntity { id = crypto.randomUUID(); createdAt = new Date(); }
class KindRepository extends EntityRepository {}
const BaseVirtualSchema = new EntitySchema({
  class: BaseVirtualEntity, abstract: true, expression: throwing, repository: () => KindRepository,
  hooks: { beforeDelete: ["teardown"] },
  properties: { id: { type: types.string }, createdAt: { type: types.datetime } },
});
// a NAMED class per pin — mikro keys metadata by class name, and an anonymous class reads as abstract
const kind = (name) => ({ [name]: class extends BaseVirtualEntity { status = "OPEN"; torn = false; teardown() { this.torn = true; } } })[name];
const init = (entities) => MikroORM.init({ ...config({ dbName: ":memory:", entities }), allowGlobalContext: true });

// the schema-side twin of the kind: every citizen built through it is virtual, no `...spread`, no retyped expression
class VirtualEntitySchema extends EntitySchema {
  constructor(options) { super({ ...options, expression: throwing }); }
}

specimen.describe("m64 M0 — beef: a VirtualSchema the citizen extends", () => {
  specimen.it("(j) `extends:` alone does NOT carry the expression — the concrete is not virtual and fails the PK law", async () => {
    const Torn = kind("Torn");
    const schema = new EntitySchema({ class: Torn, extends: BaseVirtualSchema, properties: { status: { type: types.string } } });
    await specimen.expect(init([schema])).rejects.toThrow("Torn entity is missing @PrimaryKey()");
  });

  specimen.it("(k) a retyped expression + `extends:` — props and hooks inherit, the repository does NOT", async () => {
    const Torn = kind("Torn");
    const schema = new EntitySchema({ class: Torn, extends: BaseVirtualSchema, expression: throwing, properties: { status: { type: types.string } } });
    const orm2 = await init([schema]);
    const meta2 = orm2.getMetadata().get(Torn);
    specimen.expect(meta2.virtual).toBe(true);
    specimen.expect(meta2.primaryKeys).toEqual([]);
    specimen.expect(meta2.props.map((p) => p.name).sort()).toEqual(["createdAt", "id", "status"]);
    specimen.expect(meta2.hooks.beforeDelete).toEqual(["teardown"]);
    specimen.expect(orm2.em.getRepository(Torn)).not.toBeInstanceOf(KindRepository);
    await orm2.close();
  });

  specimen.it("(l) VirtualEntitySchema: the class chain alone carries the base — no `extends:`, no expression at the citizen", async () => {
    const Torn = kind("Torn");
    const schema = new VirtualEntitySchema({ class: Torn, repository: () => KindRepository, properties: { status: { type: types.string } } });
    const orm2 = await init([schema]);
    const meta2 = orm2.getMetadata().get(Torn);
    specimen.expect(meta2.virtual).toBe(true);
    specimen.expect(meta2.extends).toBe("BaseVirtualEntity");
    specimen.expect(meta2.props.map((p) => p.name).sort()).toEqual(["createdAt", "id", "status"]);
    specimen.expect(meta2.hooks.beforeDelete).toEqual(["teardown"]);
    specimen.expect(orm2.em.getRepository(Torn)).toBeInstanceOf(KindRepository);
    const sql = await orm2.schema.getCreateSchemaSQL();
    specimen.expect(sql.toLowerCase()).not.toContain("torn");
    await orm2.close();
  });

  specimen.it("(m) metadata is ONE object across forks — a WeakMap keyed by meta is per kind per ORM, never per em", () => {
    const root = orm.getMetadata().get(ProbeEntity);
    specimen.expect(orm.em.fork().getMetadata().get(ProbeEntity)).toBe(root);
    specimen.expect(orm.em.fork().getRepository(ProbeEntity).em.getMetadata().get(ProbeEntity)).toBe(root);
  });
});

// ── beef: the per-ORM Configuration bag is STRUCK. The context constructs and holds the ONE repository; its
// `$entities` atom IS the storage. A twin mikro mints on a fork (two arguments) holds an EMPTY atom, by design.
specimen.describe("m64 M0 — beef: the context holds the storage, a fork's twin is not it", () => {
  specimen.it("(n) a fork-minted copy holds an empty atom of its own", async () => {
    const Torn = kind("Torn");
    const schema = new VirtualSchema({ class: Torn, properties: { status: { type: types.string } } });
    const orm2 = await init([schema]);
    const held = new VirtualRepository(orm2.em, Torn);
    const born = await RequestContext.create(orm2.em, () => held.create({ status: "HOT" }));
    const twin = orm2.em.fork().getRepository(Torn);
    specimen.expect(twin).toBeInstanceOf(VirtualRepository);
    specimen.expect(twin.$entities).not.toBe(held.$entities);
    specimen.expect(await twin.findOne({ id: born.id })).toBe(null);
    specimen.expect(await held.findOne({ id: born.id })).toBe(born);
    await orm2.close();
  });

  specimen.it("(o) a handed atom is the storage", async () => {
    const Torn = kind("Torn");
    const schema = new VirtualSchema({ class: Torn, properties: { status: { type: types.string } } });
    const orm2 = await init([schema]);
    const mine = atom([]);
    const held = new VirtualRepository(orm2.em, Torn, mine);
    const born = await RequestContext.create(orm2.em, () => held.create({}));
    specimen.expect(mine.get()).toEqual([born]);
    await orm2.close();
  });
});
