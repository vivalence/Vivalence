// import { BaseEntity} from "@mikro-orm/core";
import { Collection, EntitySchema, type Opt } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../0_root/BaseEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";

export enum UserRolesEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  GUEST = "GUEST",
}

export class UserEntity extends BaseEntity {
  roles: UserRolesEnum[] & Opt = [UserRolesEnum.USER];
  config: any & Opt = "{}";
  runtimes = new Collection<RuntimeEntity>(this);
  curricula = new Collection<CurriculumEntity>(this);
}

export const UserSchema = new EntitySchema<UserEntity, BaseSchema>({
  class: UserEntity,
  extends: BaseSchema,
  tableName: "User",
  properties: {
    roles: {
      columnType: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => UserRolesEnum,
      default: [UserRolesEnum.USER],
    },

    config: { type: "unknown", columnType: "json", defaultRaw: `"{}"` },

    runtimes: {
      // indicates membership
      kind: "m:n",
      entity: () => RuntimeEntity,
      inversedBy: "users",
      pivotTable: "_UserToRuntime",
    },
    curricula: {
      // indicates membership

      kind: "m:n",
      entity: () => CurriculumEntity,
      inversedBy: "users",
      pivotTable: "_CurriculumToUser",
    },
  },
});

// import { Condition } from "../3_curriculum/Condition.ts";
// import { Dependency } from "../3_curriculum/Dependency.ts";
// import { HEAD } from "../5_transient/HEAD.ts";
// import { Memory } from "../4_userland/Memory.ts";
// import { Play } from "../4_userland/Play.ts";
// import { Queue } from "../5_transient/Queue.ts";
// import { Session } from "../5_transient/Session.ts";
// import { Strategy } from "../2_runtime/Strategy.ts";
// conditionCollection = new Collection<Condition>(this);
// curriculumCollection = new Collection<Curriculum>(this);
// dependencyCollection = new Collection<Dependency>(this);
// hEADCollection = new Collection<HEAD>(this);
// memoryCollection = new Collection<Memory>(this);
// playCollection = new Collection<Play>(this);
// queueCollection = new Collection<Queue>(this);
// sessionCollection = new Collection<Session>(this);
// strategyCollection = new Collection<Strategy>(this);
// conditionCollection: {
//   kind: "1:m",
//   entity: () => Condition,
//   mappedBy: "user",
// },
// curriculumCollection: {
//   kind: "1:m",
//   entity: () => Curriculum,
//   mappedBy: "user",
// },
// dependencyCollection: {
//   kind: "1:m",
//   entity: () => Dependency,
//   mappedBy: "user",
// },
// hEADCollection: { kind: "1:m", entity: () => HEAD, mappedBy: "user" },
// memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "user" },
// playCollection: { kind: "1:m", entity: () => Play, mappedBy: "user" },
// queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "user" },
// sessionCollection: { kind: "1:m", entity: () => Session, mappedBy: "user" },
// strategyCollection: {
//   kind: "1:m",
//   entity: () => Strategy,
//   mappedBy: "user",
// },
