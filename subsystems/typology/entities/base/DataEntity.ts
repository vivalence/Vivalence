import { types, EntitySchema, EntityRepository, BaseEntity, raw, type Opt } from "@mikro-orm/core";
import { is } from "@vivalence/typology";
import { v7 } from "uuid";

export class DataEntity extends BaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
}

export class DataRepository extends EntityRepository {
  unique(x) {
    // probably ought to be able to compute this from entity schema.
    console.log(`${this.constructor.name} needs custom .unique()`);
    return x;
  }

  // async findByTrait(trait) {return this.find({ traits: { $in: [trait] } });}

  async ensure(query) {
    const existing = await this.findOne(this.unique(query));
    if (existing) {
      existing.assign(query);
      return existing;
    }
    return await this.create(query);
  }

  async updateOne(where, data) {
    const entity = await this.findOneOrFail(where);
    entity.assign(data);
    await this.em.flush();
    return entity;
  }

  async update(where, data) {
    const entities = await this.find(where);
    for (const entity of entities) entity.assign(data);
    await this.em.flush();
    return entities;
  }

  async removeOne(where) {
    const entity = await this.findOneOrFail(where);
    this.em.remove(entity);
    await this.em.flush();
    return entity;
  }

  async remove(where) {
    const entities = await this.find(where);
    for (const entity of entities) this.em.remove(entity);
    await this.em.flush();
    return entities;
  }

  find(where, opts?) {
    return super.find(this.resolveTraits(where), opts);
  }

  findOne(where, opts?) {
    return super.findOne(this.resolveTraits(where), opts);
  }

  resolveTraits(where) {
    if (!where?.traits) return where;
    const { traits, ...rest } = where;

    const spec =
      typeof traits === "string"
        ? { $contains: [traits] }
        : Array.isArray(traits)
          ? { $contains: traits }
          : traits;

    const col = `\`${this.entityName.charAt(0).toLowerCase()}0\`.traits`;
    const has = (t) => ({ [raw(`${col} LIKE ?`, [`%${t}%`])]: [] });
    const hasNot = (t) => ({ [raw(`${col} NOT LIKE ?`, [`%${t}%`])]: [] });

    const conds = [
      ...(spec.$contains ?? []).map(has),
      ...(spec.$overlap ? [{ $or: spec.$overlap.map(has) }] : []),
      ...(spec.$none ?? []).map(hasNot),
    ];

    if (conds.length) rest.$and = [...(rest.$and || []), ...conds];
    return rest;
  }

  async findByIdentifiers(refs, opts?) {
    // ugly, because dataentities dont have slugs necessarily.
    const ids = [];
    const slugs = [];

    for (const ref of Array.isArray(refs) ? refs : [refs]) {
      if (ref == null) continue;
      if (typeof ref === "string") {
        if (is.id(ref)) ids.push(ref);
        else slugs.push(ref);
      } else if (ref.id) {
        ids.push(ref.id);
      } else if (ref.slug) {
        slugs.push(ref.slug);
      }
    }

    const where: any = {};
    if (ids.length && slugs.length) {
      where.$or = [{ id: { $in: ids } }, { slug: { $in: slugs } }];
    } else if (ids.length) {
      where.id = { $in: ids };
    } else if (slugs.length) {
      where.slug = { $in: slugs };
    } else {
      return [];
    }

    return this.find(where, opts);
  }
}

export const DataSchema = new EntitySchema({
  class: DataEntity,
  abstract: true,
  repository: () => DataRepository,
  properties: {
    id: { type: types.string, primary: true, onCreate: () => v7() },
    createdAt: {
      type: types.datetime,
      onCreate: () => new Date(),
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    updatedAt: {
      type: types.datetime,
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
  },
});
