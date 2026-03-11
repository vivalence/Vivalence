import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { maps } from "@vivalence/typology/entities";

// import { PlayEntity } from "../userspace/Play.ts";

// export enum ProductTraitsEnum {}
// REVIEWED = "REVIEWED",

export class ProductEntity extends maps.userspace.product.entity {
  // plays = new Collection<PlayEntity>(this);
  // scope embed?? strategy?: string & Opt = null; tactic?: string & Opt = null; game?: string & Opt = null;
}

export const ProductSchema = new EntitySchema({
  class: ProductEntity,
  extends: maps.userspace.product.schema,
  tableName: "Product",
  name: "Product",
  properties: {
    // mode: {kind: "m:1", entity: () => ModeEntity, fieldName: "mode",},
    // plays: {kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.product,},
  },
});

export default {
  type: "product",
  // traits: ProductTraitsEnum,
  schema: ProductSchema,
  entity: ProductEntity,
  // repository: TopographyRepository,
};
