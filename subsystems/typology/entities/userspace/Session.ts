import { EntitySchema, Collection, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../index.ts";
import { UserEntity } from "../index.ts";
import { IntentEntity } from "../index.ts";

export enum SessionTraitsEnum {
  _ = "_",
}

export class SessionEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  traits: SessionTraitsEnum[] & Opt = [];

  intent: Rel<IntentEntity>;

  state: any & Opt = {};
  history: any & Opt = {};
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
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => SessionTraitsEnum,
      default: [],
    },

    intent: {
      kind: "m:1",
      entity: () => IntentEntity,
      fieldName: "intent",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    state: { type: "json" },
    history: { type: "json" },
  },
});
export default {
  type: "session",
  schema: SessionSchema,
  entity: SessionEntity,
};
