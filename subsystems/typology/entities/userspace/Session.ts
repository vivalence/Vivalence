import { EntitySchema, Collection, types, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../index.ts";
import { UserEntity } from "../index.ts";
import { ProductEntity } from "../index.ts";

export enum SessionTraitsEnum {
  _ = "_", // ?stateful
}

export class SessionEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  traits: SessionTraitsEnum[] & Opt = [];
  data: any & Opt = {};
  cursor: number & Opt = 0;
  counter: number & Opt = 0;

  products = new Collection<ProductEntity>(this);
  // intent: Rel<IntentEntity>;
}

export const SessionSchema = new EntitySchema<SessionEntity, BaseEntity>({
  class: SessionEntity,
  extends: BaseSchema,
  tableName: "Session",
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    traits: {
      columnType: "json",
      defaultRaw: `'[]'`,
      enum: true,
      array: true,
      items: () => SessionTraitsEnum,
    },
    data: { type: types.json },
    counter: { type: types.integer },
    cursor: { type: types.integer },

    // intent: {kind: "m:1", entity: () => IntentEntity, fieldName: "intent", updateRule: "cascade", deleteRule: "cascade",},

    products: {
      kind: "1:m",
      entity: () => ProductEntity,
      mappedBy: (product) => product.session,
      fieldName: "products",
    },
  },
});
export default {
  type: "session",
  schema: SessionSchema,
  entity: SessionEntity,
};
