import { BaseEntity, EntitySchema, EntityRepository, EventType, Utils, types, type EntityManager, type EntityMetadata, type EntityName, type EntitySchemaMetadata } from "@mikro-orm/core";
import { object, NotFound } from "@vivalence/typology";
import { atom, type WritableAtom } from "nanostores";
import { v7 } from "uuid";

// process-resident: mikro metadata · factory · events · serializer — no table, no identity map, no unit of work.
// handles (controllers, gates, streams) are PRIVATE fields: not metadata → never in the strip, never in toJSON.
export class VirtualEntity extends BaseEntity {
  id: string = v7();
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
}

// The repository IS the storage, and the storage is reactive: `$entities` is the same nanostores atom the remote side holds
// (`this.$entities = entityManager.stores[name]`), so `get`/`subscribe` read alike on both ends. The context constructs and
// holds the ONE instance — `entities.probe = new VirtualRepository(orm.em, ProbeEntity)` — the class is mikro's own second
// argument, the atom an optional third (a context may hand one in). A twin mikro mints on a fork (two arguments) holds an
// EMPTY atom: nobody asks mikro for a virtual repository (measured). The wire is still the EventManager path — the atom is in-process.
export class VirtualRepository<T extends VirtualEntity = VirtualEntity> extends EntityRepository<T> {
  readonly $entities: WritableAtom<T[]>;
  constructor(em: EntityManager, entityName: EntityName<T>, $entities: WritableAtom<T[]> = atom([])) {
    super(em, entityName);
    this.$entities = $entities;
  }
  #meta(): EntityMetadata { return this.em.getMetadata().get(Utils.className(this.entityName)); }
  #dispatch(event: EventType, entity: T) {
    const meta = this.#meta();
    return this.em.getEventManager().dispatchEvent(event, { entity, em: this.em, meta }, meta);
  }
  // belt: own enumerable metadata props (a private handle never appears), every to-one collapsed to its id (measured e)
  #plain(entity: T): Record<string, unknown> {
    const meta = this.#meta();
    const plain = object.pick(entity, meta.props.map((prop) => prop.name));
    for (const prop of meta.relations) plain[prop.name] = plain[prop.name]?.id ?? plain[prop.name];
    return plain;
  }
  #match(where: object): T[] { return this.$entities.get().filter((entity) => object.match(this.#plain(entity), where)); }
  #set(entities: T[]) { this.$entities.set(entities); }              // a NEW reference → listeners fire (atom/index.js:66-71)

  // ── queries (the datamap.repository verb set; `options` — populate/orderBy/limit — are not served) ──
  async find(where: object = {}): Promise<T[]> { return this.#match(where); }
  async findOne(where: object = {}): Promise<T | null> { return this.#match(where)[0] ?? null; }
  async findOneOrFail(where: object): Promise<T> {
    const entity = await this.findOne(where);
    if (!entity) throw new NotFound(`${Utils.className(this.entityName)} ${JSON.stringify(where)}`);
    return entity;
  }
  async findAndCount(where: object = {}): Promise<[T[], number]> { const hits = this.#match(where); return [hits, hits.length]; }
  async count(where: object = {}): Promise<number> { return this.#match(where).length; }

  // ── mutations — before/after through the ORM's EventManager, then a re-set of the store ──
  async create(data: object): Promise<T> {
    const { id } = data as { id?: string };
    if (id && (await this.findOne({ id }))) throw new Error(`${Utils.className(this.entityName)} ${id} is held`);
    const entity = this.em.create(this.entityName, data as any, { persist: false }) as T;   // factory only: persistOnCreate would park it in the fork's unit of work (measured)
    await this.#dispatch(EventType.beforeCreate, entity);
    this.#set([...this.$entities.get().filter((held) => held.id !== entity.id), entity]);   // id unique, never duplicated
    await this.#dispatch(EventType.afterCreate, entity);
    return entity;
  }
  async updateOne(where: object, data: object): Promise<T> {
    const entity = await this.findOneOrFail(where);
    await this.#dispatch(EventType.beforeUpdate, entity);
    const { id: _id, ...patch } = data as { id?: string };
    entity.assign({ ...patch, updatedAt: new Date() } as any, { em: this.em });
    this.#set([...this.$entities.get()]);                                     // in place, then re-set
    await this.#dispatch(EventType.afterUpdate, entity);
    return entity;
  }
  async update(where: object, data: object): Promise<T[]> {
    return Promise.all(this.#match(where).map((entity) => this.updateOne({ id: entity.id }, data)));
  }
  async removeOne(where: object): Promise<T> {
    const entity = await this.findOneOrFail(where);
    await this.#dispatch(EventType.beforeDelete, entity);                    // the schema's hooks.beforeDelete fires here
    this.#set(this.$entities.get().filter((held) => held !== entity));
    await this.#dispatch(EventType.afterDelete, entity);
    return entity;
  }
  async remove(where: object = {}): Promise<T[]> {
    return Promise.all(this.#match(where).map((entity) => this.removeOne({ id: entity.id })));
  }
  async upsert(data: { id?: string }): Promise<T> {
    return data.id && (await this.findOne({ id: data.id })) ? this.updateOne({ id: data.id }, data) : this.create(data);
  }
}

// the abstract base — DataSchema's twin; module-private, discovery reaches it through the class chain (measured l)
const base = new EntitySchema({
  class: VirtualEntity,
  abstract: true,
  properties: { id: { type: types.string }, createdAt: { type: types.datetime }, updatedAt: { type: types.datetime } },
});

// the schema of a virtual kind — pins expression + repository, which `extends:` never copies (measured j, k).
// a citizen names class · properties · hooks; `...options` after `repository` lets a kind bring a VirtualRepository subclass.
export class VirtualSchema<T extends VirtualEntity = VirtualEntity> extends EntitySchema<T, VirtualEntity> {
  constructor(options: EntitySchemaMetadata<T, VirtualEntity>) {
    super({
      extends: base,
      repository: () => VirtualRepository,
      ...options,
      expression: () => { throw new Error("a virtual entity is served from its repository, never the driver"); },
    });
  }
}
