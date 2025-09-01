import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";
import { IdentityEntity } from "./Identity.ts";

export class ShardEntity extends BaseEntity {
  type!: string;
  url!: string;
  slug!: string;
  identity!: Rel<IdentityEntity>;
}

export const ShardSchema = new EntitySchema({
  class: ShardEntity,
  extends: BaseSchema,
  tableName: "Shard",
  properties: {
    slug: { type: types.string, unique: true },
    type: { type: types.string },
    url: { type: types.string },
    identity: {
      kind: "m:1",
      entity: () => IdentityEntity,
      fieldName: "identity",
      updateRule: "cascade",
      deleteRule: "cascade",
      lazy: true,
    },
  },
});
