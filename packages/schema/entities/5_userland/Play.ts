import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../0_root/BaseEntity.ts";
import { UserEntity } from "../1_repo/User.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { GameEntity } from "../2_runtime/Game.ts";
import { DependencyEntity } from "../4_curriculum/Dependency.ts";
import { TacticEntity } from "../4_curriculum/Tactic.ts";
import { TagEntity } from "../4_curriculum/Tag.ts";
import { UnitEntity } from "../4_curriculum/Unit.ts";

import { MemoryEntity } from "../5_userland/Memory.ts";

export class PlayEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  runtime!: Rel<RuntimeEntity>;
  dependency?: Rel<DependencyEntity>;
  tactic?: Rel<TacticEntity>;
  game?: Rel<GameEntity>;
  unit?: Rel<UnitEntity>;
  tag?: Rel<TagEntity>;
  memory!: Rel<MemoryEntity>;

  history: any & Opt = "[]";
  signal: any & Opt = "{}";
  nextIn!: number & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;
}

export const PlaySchema = new EntitySchema<PlayEntity, BaseEntity>({
  class: PlayEntity,
  extends: BaseSchema,
  tableName: "Play",
  // indexes: [{name: "gameIndexOnPlay", expression: 'CREATE INDEX "gameIndexOnPlay" ON public."Play" USING btree ("game")', properties: ["game"],}, {name: "memoryIndexOnPlay", expression: 'CREATE INDEX "memoryIndexOnPlay" ON public."Play" USING btree ("memory")', properties: ["memory"],}, {name: "tacticIndexOnPlay", expression: 'CREATE INDEX "tacticIndexOnPlay" ON public."Play" USING btree ("tactic")', properties: ["tactic"],}, {name: "tagIndexOnPlay", expression: 'CREATE INDEX "tagIndexOnPlay" ON public."Play" USING btree ("tag")', properties: ["tag"],}, {name: "unitIndexOnPlay", expression: 'CREATE INDEX "unitIndexOnPlay" ON public."Play" USING btree ("unit")', properties: ["unit"],}, {name: "userIndexOnPlay", expression: 'CREATE INDEX "userIndexOnPlay" ON public."Play" USING btree ("user")', properties: ["user"],},],
  // uniques: [{ properties: ["unit", "tag", "game", "tactic"] }],

  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    dependency: {
      kind: "m:1",
      entity: () => DependencyEntity,
      fieldName: "dependency",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
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
    unit: {
      kind: "m:1",
      entity: () => UnitEntity,
      fieldName: "unit",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    tag: {
      kind: "m:1",
      entity: () => TagEntity,
      fieldName: "tag",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    memory: {
      kind: "m:1",
      entity: () => MemoryEntity,
      fieldName: "memory",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    history: { type: "json" },
    signal: { type: "json" },
    nextIn: { type: Number, defaultRaw: `0.0`, fieldName: "nextIn" },
    nextAt: { type: Date, lazy: true, fieldName: "nextAt" },
    lastAt: { type: Date, lazy: true, fieldName: "lastAt" },
  },
});
