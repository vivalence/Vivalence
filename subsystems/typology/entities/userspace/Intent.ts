import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../index.ts";
import { UserEntity } from "../index.ts";
import { SessionEntity } from "../index.ts";

export enum IntentTraitsEnum {
  BOOKMARKED = "BOOKMARKED",
  RESOLVED = "RESOLVED",
}

export class IntentEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  traits: IntentTraitsEnum[] & Opt = [];
  data: any & Opt = {}; // pojojson
  sessions = new Collection<SessionEntity>(this);
  // products: Rel<ProductEntity>;
}

export const IntentSchema = new EntitySchema<IntentEntity, BaseEntity>({
  class: IntentEntity,
  extends: BaseSchema,
  tableName: "Intent",
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    traits: {
      enum: true,
      array: true,
      items: () => IntentTraitsEnum,
      default: [],
      defaultRaw: `[]`,
      columnType: "json",
    },

    sessions: {
      kind: "1:m",
      entity: () => SessionEntity,
      mappedBy: (session) => session.intent,
    },

    data: { type: "json" },
  },
});

export default {
  type: "intent",
  schema: IntentSchema,
  entity: IntentEntity,
};
