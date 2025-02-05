import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Dependency } from "../3_curriculum/Dependency.ts";
import { Game } from "../2_runtime/Game.ts";
import { Memory } from "../4_userland/Memory.ts";
import { Runtime } from "../1_repo/Runtime.ts";
import { Tactic } from "../3_curriculum/Tactic.ts";
import { Tag } from "../3_curriculum/Tag.ts";
import { Unit } from "../3_curriculum/Unit.ts";
import { User } from "../0_root/User.ts";

export class Play extends BaseModuleEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  user!: Rel<User>;
  runtime!: Rel<Runtime>;
  dependency?: Rel<Dependency>;
  game?: Rel<Game>;
  tactic?: Rel<Tactic>;
  unit?: Rel<Unit>;
  tag?: Rel<Tag>;
  memory!: Rel<Memory>;
  history: any & Opt = "[]";
  signal: any & Opt = "{}";
  nextIn!: string & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;
}

export const PlaySchema = new EntitySchema({
  class: Play,
  tableName: "Play",
  indexes: [
    {
      name: "gameIndexOnPlay",
      expression: 'CREATE INDEX "gameIndexOnPlay" ON public."Play" USING btree ("game")',
      properties: ["game"],
    },
    {
      name: "memoryIndexOnPlay",
      expression: 'CREATE INDEX "memoryIndexOnPlay" ON public."Play" USING btree ("memory")',
      properties: ["memory"],
    },
    {
      name: "tacticIndexOnPlay",
      expression: 'CREATE INDEX "tacticIndexOnPlay" ON public."Play" USING btree ("tactic")',
      properties: ["tactic"],
    },
    {
      name: "tagIndexOnPlay",
      expression: 'CREATE INDEX "tagIndexOnPlay" ON public."Play" USING btree ("tag")',
      properties: ["tag"],
    },
    {
      name: "unitIndexOnPlay",
      expression: 'CREATE INDEX "unitIndexOnPlay" ON public."Play" USING btree ("unit")',
      properties: ["unit"],
    },
    {
      name: "userIndexOnPlay",
      expression: 'CREATE INDEX "userIndexOnPlay" ON public."Play" USING btree ("user")',
      properties: ["user"],
    },
  ],
  uniques: [
    {
      name: "Play_user_unit_tag_game_tactic_key",
      expression:
        'CREATE UNIQUE INDEX "Play_user_unit_tag_game_tactic_key" ON public."Play" USING btree ("user", "unit", "tag", "game", "tactic")',
      properties: ["user", "unit", "tag", "game", "tactic"],
    },
  ],
  properties: {
    id: { primary: true, type: "text" },
    createdAt: {
      type: "datetime",
      fieldName: "createdAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    updatedAt: {
      type: "datetime",
      fieldName: "updatedAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    user: {
      kind: "m:1",
      entity: () => User,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
      index: "userIndexOnPlay",
    },
    runtime: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    dependency: {
      kind: "m:1",
      entity: () => Dependency,
      fieldName: "dependency",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    game: {
      kind: "m:1",
      entity: () => Game,
      fieldName: "game",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
      index: "gameIndexOnPlay",
    },
    tactic: {
      kind: "m:1",
      entity: () => Tactic,
      fieldName: "tactic",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
      index: "tacticIndexOnPlay",
    },
    unit: {
      kind: "m:1",
      entity: () => Unit,
      fieldName: "unit",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
      index: "unitIndexOnPlay",
    },
    tag: {
      kind: "m:1",
      entity: () => Tag,
      fieldName: "tag",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
      index: "tagIndexOnPlay",
    },
    memory: {
      kind: "m:1",
      entity: () => Memory,
      fieldName: "memory",
      updateRule: "cascade",
      deleteRule: "cascade",
      index: "memoryIndexOnPlay",
    },
    history: { type: "json" },
    signal: { type: "json" },
    nextIn: {
      type: "decimal",
      fieldName: "nextIn",
      precision: 65,
      scale: 30,
      defaultRaw: `0.0`,
    },
    nextAt: {
      type: "datetime",
      fieldName: "nextAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    lastAt: {
      type: "datetime",
      fieldName: "lastAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
  },
});
