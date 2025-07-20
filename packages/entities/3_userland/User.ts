import { Collection, EntitySchema, type Opt } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../0_root/BaseEntity.ts";
// import { IntentEntity } from "../3_userland/Intent.ts";
// import { SessionEntity } from "../3_userland/Session.ts";

export enum UserRolesEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  GUEST = "GUEST",
}

export class UserEntity extends BaseEntity {
  roles: UserRolesEnum[] & Opt = [UserRolesEnum.USER];
  config: any & Opt = {};

  // sessions = new Collection<SessionEntity>(this);
  // intents = new Collection<IntentEntity>(this);
}

export const UserSchema = new EntitySchema<UserEntity, BaseEntity>({
  class: UserEntity,
  extends: BaseSchema,
  tableName: "User",
  // abstract: true,
  properties: {
    roles: {
      items: () => UserRolesEnum,
      enum: true,
      array: true,
      default: [UserRolesEnum.USER],
      defaultRaw: `["${UserRolesEnum.USER}"]`,
      columnType: "json",
    },
    config: { type: "json" },

    // intents: {
    //   kind: "1:m",
    //   entity: () => IntentEntity,
    //   mappedBy: (intent) => intent.user,
    // },
    // sessions: {
    //   kind: "1:m",
    //   entity: () => SessionEntity,
    //   mappedBy: (session) => session.user,
    // },
  },
});
