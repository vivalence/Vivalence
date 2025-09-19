import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";
import { IdentityEntity } from "./Identity.ts";

export class RuntimeEntity extends BaseEntity {
  type!: string;
  url!: string;
  slug!: string;
  identity!: Rel<IdentityEntity>;
}

export const RuntimeSchema = new EntitySchema({
  class: RuntimeEntity,
  extends: BaseSchema,
  tableName: "Runtime",
  properties: {
    slug: { type: types.string, unique: true },
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
