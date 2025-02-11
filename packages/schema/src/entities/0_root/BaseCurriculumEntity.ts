import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseSchema, BaseEntity } from "../0_root/BaseEntity.ts";

// import * as crypto from "jsr:@std/crypto";
// import { encodeHex } from "jsr:@std/encoding/hex";

// async function hash(scope: any, assertion: any) {
// async function hash(arr: any[]) {const message = JSON.stringify(arr); const messageBuffer = new TextEncoder().encode(message); const hashBuffer = await crypto.subtle.digest("SHA-256", messageBuffer); const hash = encodeHex(hashBuffer); console.log(hash); return hash;}
//   deno crypto sha compute (arr)
//   return JSON.stringify(arr);
// }

// export class BaseCurriculumRepository extends EntityRepository<BaseCurriculumEntity> {
// custom methods...
// get slugHash: string(){}
// slugHashFork(){}
// get slugHashSet: any[](){}
// public guarantee(...) {}
// public expect(args: any) {
//   console.log("BaseCurriculumRepository expect", args);
//   // create
// }
// }

export class BaseCurriculumEntity extends BaseEntity {
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

export const BaseCurriculumSchema = new EntitySchema<BaseCurriculumEntity, BaseEntity>({
  class: BaseCurriculumEntity,
  extends: BaseSchema,
  name: "BaseCurriculumEntity",
  abstract: true,
  properties: {
    slug: { type: String },
    name: { type: String, nullable: true },
    description: { type: String, nullable: true },

    // slugHashSet: { type: "method", persist: true, getter: true, getterName: "slugHashSet" },
    // slugHashFork: { type: "method", persist: true, getter: true, getterName: "slugHashFork" },
  },
});
