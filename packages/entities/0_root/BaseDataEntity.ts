import { EntitySchema, type Opt } from "@mikro-orm/core";
import { BaseSchema, BaseEntity } from "../0_root/BaseEntity.ts";
// import { EntityRepositoryType, EntityRepository } from "@mikro-orm/core";
// import { crypto } from "@std/crypto";
// import { encodeHex } from "@std/encoding/hex";

// function hash(arr: any[]) {const message = JSON.stringify(arr.sort()); const messageBuffer = new TextEncoder().encode(message); const hashBuffer = crypto.subtle.digestSync("SHA-256", messageBuffer); const hash = encodeHex(hashBuffer); return hash;}
// get slugHash: string(){}
// slugHashFork(){}
// get slugHashSet: any[](){}
// public guarantee(...) {}

// Temporary hack; only used in @domain/learning/entities/ontology
export class BaseDataRepository extends Array {
  "#entity": any;
  public async add(entity: any) {
    super.push(entity);
  }
  public async create(data: any) {
    const entity = new this["#entity"](data);
    super.push(entity);
    return entity;
    // if (data.id) return await em.findOne(this.entityName, data.id);
    // if (!data.slug) data.slug = hash([data.scope, data.assertion]);
    // const entity = await em.findOne(this.entityName, { slug: data.slug, runtime: data.runtime });
    // if (entity) return entity;
    // return em.create(this.entityName, data);
  }
  public delete(entity: any) {
    //
  }
  // public async find(data: any) {}
  // public async findOne(data: any) {}
}

export class BaseDataEntity extends BaseEntity {
  // [EntityRepositoryType]?: BaseOntologyRepository;
  slug: string & Opt = "";
  name?: string;
  description?: string;
  // // this technique makes complex entities evolvable while providing a hook for runtime guarantees.
  // get slugHashSet() {
  //   return [this.scope, this.assertion];
  // }
  // get slugHashFork() {
  //   const slughash = hash(this.slugHashSet);
  //   // fork if (this.slug!== slughash)
  //   if (this.slug !== slughash) {
  //     this.slug = slughash;
  //     // mark runtime guarantees as dirty
  //     // create new entity (slug) with the same runtime
  //   }
  //   return this.slug;
  // }
}

export const BaseDataSchema = new EntitySchema<BaseDataEntity, BaseEntity>({
  class: BaseDataEntity,
  extends: BaseSchema,
  name: "BaseDataEntity",
  abstract: true,
  properties: {
    slug: { type: String },
    name: { type: String, nullable: true },
    description: { type: String, nullable: true },

    // slugHashSet: { type: "method", persist: true, getter: true, getterName: "slugHashSet" },
    // slugHashFork: { type: "method", persist: true, getter: true, getterName: "slugHashFork" },
  },
});
// export const BaseCurriculumSchema = new EntitySchema<BaseOntologyEntity, BaseEntity>({
//   class: BaseOntologyEntity,
//   extends: BaseSchema,
//   repository: () => BaseOntologyRepository,
//   name: "BaseCurriculumEntity",
//   abstract: true,
//   hooks: {
//     beforeCreate: [
//       (args: EventArgs<BaseOntologyEntity>) => {
//         // extends<BaseOntologyEntity>
//         // if (!args.entity.slug) args.entity.slug = hash([args.entity.scope, args.entity.assertion]);
//       },
//     ],
//   },
//   // uniques: [{ properties: ["slug", "runtime"] },],
//   properties: {
//     slug: { type: String },
//     name: { type: String, nullable: true },
//     description: { type: String, nullable: true },

//     // slugHashSet: { type: "method", persist: true, getter: true, getterName: "slugHashSet" },
//     // slugHashFork: { type: "method", persist: true, getter: true, getterName: "slugHashFork" },
//   },
// });
