import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/entities";
import { UserEntity } from "@vivalence/entities";
// import { UserEntity } from "../view/User.ts";

import { TagEntity } from "../corpus/Tag.ts";
import { UnitEntity } from "../corpus/Unit.ts";
import { MemoryEntity } from "../userland/Memory.ts";
import { ExerciseEntity } from "../userland/Exercise.ts";

export class PlayEntity extends BaseEntity {
  user!: Rel<UserEntity>;

  unit?: Rel<UnitEntity>;
  tag?: Rel<TagEntity>;
  strategy?: string & Opt = null;
  tactic?: string & Opt = null;
  game?: string & Opt = null;

  memory!: Rel<MemoryEntity>;

  exercise!: Rel<ExerciseEntity>;

  signal: any & Opt = {};
  debrief?: any & Opt = {};
  nextIn!: number & Opt;
  nextAt!: Date & Opt;
}

export const PlaySchema = new EntitySchema<PlayEntity, BaseEntity>({
  class: PlayEntity,
  extends: BaseSchema,
  tableName: "Play",
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
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

    game: { type: "string", nullable: true },
    tactic: { type: "string", nullable: true },
    strategy: { type: "string", nullable: true },

    memory: {
      kind: "m:1",
      entity: () => MemoryEntity,
      fieldName: "memory",
    },

    exercise: {
      kind: "m:1",
      entity: () => ExerciseEntity,
      fieldName: "exercise",
    },

    signal: { type: "json" },
    debrief: { type: "json", nullable: true },

    nextIn: { type: Number, defaultRaw: `0.0`, fieldName: "nextIn" },
    nextAt: { type: Date, fieldName: "nextAt" },
  },
});
