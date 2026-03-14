import { Collection, EntitySchema, types, type Opt } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../index.ts";
import { SessionEntity } from "../index.ts";

export enum UserRolesEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  GUEST = "GUEST",
}

export class UserEntity extends BaseEntity {
  roles: UserRolesEnum[] & Opt = [UserRolesEnum.USER];
  config: any & Opt = {};

  sessions = new Collection<SessionEntity>(this);
  // intents = new Collection<IntentEntity>(this);
}

export const UserSchema = new EntitySchema<UserEntity, BaseEntity>({
  class: UserEntity,
  extends: BaseSchema,
  tableName: "User",
  name: "user",

  properties: {
    roles: {
      items: () => UserRolesEnum,
      enum: true,
      array: true,
      defaultRaw: `'["${UserRolesEnum.USER}"]'`,
      columnType: "json",
    },
    config: { type: types.json },

    // intents: {kind: "1:m", entity: () => IntentEntity, mappedBy: (intent) => intent.user,},

    sessions: {
      kind: "1:m",
      entity: () => SessionEntity,
      mappedBy: (session) => session.user,
    },
  },
});

export default {
  type: "user",
  schema: UserSchema,
  entity: UserEntity,
};
