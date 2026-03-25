import {
  types,
  EntitySchema,
  EntityRepository,
  BaseEntity,
  EntityRepositoryType,
  type Opt,
} from "@mikro-orm/core";
import { is } from "@vivalence/typology";
import { v7 } from "uuid";

export class DataEntity extends BaseEntity {
  [EntityRepositoryType]?: DataRepository;
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;

  // slug: string & Opt = "";
  // name?: string;
  // description?: string;

  // traits: string[] & Opt = [];
  // type?: string;
  // data: any & Opt = {};
}

export class DataRepository extends EntityRepository {
  unique(x) {
    // probably ought to be able to compute this from entity schema.
    console.log(`${this.constructor.name} needs custom .unique()`);
    return x;
  }
  async findByTrait(trait) {
    return this.find({ traits: { $in: [trait] } });
  }
  async ensure(query) {
    const existing = await this.findOne(this.unique(query));
    if (existing) {
      existing.assign(query);
      return existing;
    }
    return await this.create(query);
  }

  async findByIdentifiers(refs, opts?) {
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
      lazy: true,
    },
    updatedAt: {
      type: types.datetime,
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
      defaultRaw: `CURRENT_TIMESTAMP`,
      lazy: true,
    },

    // slug: { type: types.string },
    // name: { type: types.string, nullable: true },
    // description: { type: types.string, nullable: true },

    // type: { type: types.string, nullable: true },
    // traits: {type: types.json, enum: true, array: true, items: () => [], default: [],},
    // data: { type: types.json, default: {} },
  },
});
