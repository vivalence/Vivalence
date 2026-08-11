import { Collection, EntitySchema, types, type Opt } from "@mikro-orm/core";

import { DataEntity, DataSchema } from "../index.ts";
import { ThreadEntity } from "../index.ts";

export enum UserRolesEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  GUEST = "GUEST",
}

export class UserEntity extends DataEntity {
  roles: UserRolesEnum[] & Opt = [UserRolesEnum.USER];
  config: any & Opt = {};

  threads = new Collection<ThreadEntity>(this);
  // intents = new Collection<IntentEntity>(this);
}

export const UserSchema = new EntitySchema<UserEntity, DataEntity>({
  class: UserEntity,
  extends: DataSchema,
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

    threads: {
      kind: "1:m",
      entity: () => ThreadEntity,
      mappedBy: (thread) => thread.user,
    },
  },
});

export default {
  type: "user",
  schema: UserSchema,
  entity: UserEntity,
};
