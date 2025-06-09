import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/entities";
import { UserEntity } from "@vivalence/entities";

import { DependencyEntity } from "../corpus/Dependency.ts";
import { TagEntity } from "../corpus/Tag.ts";
import { UnitEntity } from "../corpus/Unit.ts";

import { MemoryEntity } from "../userland/Memory.ts";
import { SessionEntity } from "../transient/Session.ts";

export class PlayEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  session?: Rel<SessionEntity>;
  dependency?: Rel<DependencyEntity>;

  // Currently Tactic and Game dont touch the database as theyre kept as modules.
  // tactic?: Rel<TacticEntity>; game?: Rel<GameEntity>;
  tactic?: string;
  game?: string;

  unit?: Rel<UnitEntity>;
  tag?: Rel<TagEntity>;
  memory!: Rel<MemoryEntity>;

  data: any & Opt = {};
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
  indexes: [],
  // uniques: [{ properties: ['user','session',"unit", "tag", "game", "tactic"] }],

  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    // runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",},
    session: {
      kind: "m:1",
      entity: () => SessionEntity,
      fieldName: "session",
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

    game: { type: "string", nullable: true },
    tactic: { type: "string", nullable: true },
    // game: {kind: "m:1", entity: () => GameEntity, fieldName: "game", updateRule: "cascade", deleteRule: "cascade", nullable: true,},
    // tactic: {kind: "m:1", entity: () => TacticEntity, fieldName: "tactic", updateRule: "cascade", deleteRule: "cascade", nullable: true,},
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
    data: {
      type: "json",
      defaultRaw: `"{}"`,
      default: {},
    },
    history: { type: "json" },
    signal: { type: "json" },
    nextIn: { type: Number, defaultRaw: `0.0`, fieldName: "nextIn" },
    nextAt: { type: Date, fieldName: "nextAt" },
    lastAt: { type: Date, fieldName: "lastAt" },
  },
});
