import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../0_root/BaseEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { GameEntity } from "../2_runtime/Game.ts";
import { DependencyEntity } from "../4_curriculum/Dependency.ts";
import { TacticEntity } from "../4_curriculum/Tactic.ts";

export enum InstructionStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  ERROR = "ERROR",
}

export class InstructionEntity extends BaseEntity {
  // user!: Rel<User>;
  runtime!: Rel<RuntimeEntity>;
  dependency?: Rel<DependencyEntity>;
  tactic?: Rel<TacticEntity>;
  game?: Rel<GameEntity>;

  index: number & Opt = 0;
  status: InstructionStatusEnum & Opt = InstructionStatusEnum.PENDING;
  data: any & Opt = "{}";
}

export const InstructionSchema = new EntitySchema<InstructionEntity, BaseEntity>({
  class: InstructionEntity,
  extends: BaseSchema,
  tableName: "Instruction",
  properties: {
    // user: {kind: "m:1", entity: () => User, fieldName: "user", updateRule: "cascade", deleteRule: "cascade",},
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    game: {
      kind: "m:1",
      entity: () => GameEntity,
      fieldName: "game",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    tactic: {
      kind: "m:1",
      entity: () => TacticEntity,
      fieldName: "tactic",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    dependency: {
      kind: "m:1",
      entity: () => DependencyEntity,
      fieldName: "dependency",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    index: { type: Number },
    data: { type: "json" },
    status: {
      enum: true,
      items: () => InstructionStatusEnum,
      default: InstructionStatusEnum.PENDING,
      onCreate: () => InstructionStatusEnum.PENDING,
    },
  },
});
