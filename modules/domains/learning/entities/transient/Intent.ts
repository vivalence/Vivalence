import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/entities";
import { UserEntity } from "@vivalence/entities";

// import { GameEntity } from "../2_module/Game.ts";
// import { TacticEntity } from "../2_module/Tactic.ts";

// import { DependencyEntity } from "../4_data/Dependency.ts";

export enum IntentStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  ERROR = "ERROR",
}

export class IntentEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  // runtime!: Rel<RuntimeEntity>;
  // dependency?: Rel<DependencyEntity>;
  // tactic?: Rel<TacticEntity>;
  // game?: Rel<GameEntity>;

  index: number & Opt = 0;
  status: IntentStatusEnum & Opt = IntentStatusEnum.PENDING;
  data: any & Opt = "{}";
  scope: any & Opt = "{}";
  bundle: any & Opt = "{}";
  // type intent, scope, bundle
}

export const IntentSchema = new EntitySchema<IntentEntity, BaseEntity>({
  class: IntentEntity,
  extends: BaseSchema,
  tableName: "Intent",
  properties: {
    // user: {kind: "m:1", entity: () => User, fieldName: "user", updateRule: "cascade", deleteRule: "cascade",},
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    // runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",},
    // game: {kind: "m:1", entity: () => GameEntity, fieldName: "game", updateRule: "cascade", deleteRule: "cascade", nullable: true,},
    // tactic: {kind: "m:1", entity: () => TacticEntity, fieldName: "tactic", updateRule: "cascade", deleteRule: "cascade", nullable: true,},
    // dependency: {kind: "m:1", entity: () => DependencyEntity, fieldName: "dependency", updateRule: "cascade", deleteRule: "cascade", nullable: true,},
    index: { type: Number },
    data: { type: "json" },
    scope: { type: "json" },
    bundle: { type: "json" },
    status: {
      enum: true,
      items: () => IntentStatusEnum,
      default: IntentStatusEnum.PENDING,
      onCreate: () => IntentStatusEnum.PENDING,
    },
  },
});
