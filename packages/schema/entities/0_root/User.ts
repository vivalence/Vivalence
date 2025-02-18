import { Collection, EntitySchema, type Opt } from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../0_root/BaseEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";
// import { DependencyEntity } from "../3_curriculum/Dependency.ts";

export enum UserRolesEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  GUEST = "GUEST",
}

// mostly ignored atm.

export class UserEntity extends BaseEntity {
  runtimes = new Collection<RuntimeEntity>(this);
  curricula = new Collection<CurriculumEntity>(this);
  // dependencies = new Collection<DependencyEntity>(this);

  roles: UserRolesEnum[] & Opt = [UserRolesEnum.USER];
  config: any & Opt = "{}";
}

// plays: {kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.runtime, lazy: true,}, memories: {kind: "1:m", entity: () => MemoryEntity, mappedBy: (memory) => memory.runtime, lazy: true,}, instructions: {kind: "1:m", entity: () => InstructionEntity, mappedBy: (instruction) => instruction.runtime, lazy: true,}, units: tags.
// memories = new Collection<MemoryEntity>(this); plays = new Collection<PlayEntity>(this); instructions = new Collection<InstructionEntity>(this);
// instructions, session, HEAD,

export const UserSchema = new EntitySchema<UserEntity, BaseEntity>({
  class: UserEntity,
  extends: BaseSchema,
  tableName: "User",
  properties: {
    runtimes: {
      // indicates membership/ ie. allows access
      kind: "m:n",
      entity: () => RuntimeEntity,
      inversedBy: "users",
      pivotTable: "_UserToRuntime",
    },
    curricula: {
      // indicates membership/ ie. allows access
      kind: "m:n",
      entity: () => CurriculumEntity,
      inversedBy: "users",
      pivotTable: "_CurriculumToUser",
    },
    // dependencies: {
    //   // indicates ownership
    //   kind: "1:m",
    //   entity: () => DependencyEntity,
    // },

    roles: {
      items: () => UserRolesEnum,
      enum: true,
      array: true,
      default: [UserRolesEnum.USER],
      defaultRaw: `["${UserRolesEnum.USER}"]`,
      columnType: "json",
    },

    config: { type: "json" },
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

// dependencyCollection: {kind: "1:m", entity: () => Dependency, mappedBy: "user",},
// hEADCollection: { kind: "1:m", entity: () => HEAD, mappedBy: "user" },
// memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "user" },
// playCollection: { kind: "1:m", entity: () => Play, mappedBy: "user" },
// queueCollection: { kind: "1:m", entity: () => Queue, mappedBy: "user" },
// sessionCollection: { kind: "1:m", entity: () => Session, mappedBy: "user" },
// strategyCollection: {kind: "1:m", entity: () => Strategy, mappedBy: "user",},
