import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../0_root/BaseEntity.ts";
import { UserEntity } from "../1_system/User.ts";
import { SessionEntity } from "../3_userland/Session.ts";

export enum IntentTraitsEnum {
  BOOKMARKED = "BOOKMARKED",
  RESOLVED = "RESOLVED",
}

export class IntentEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  traits: IntentTraitsEnum[] & Opt = [];
  data: any & Opt = {};

  sessions = new Collection<SessionEntity>(this);
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
