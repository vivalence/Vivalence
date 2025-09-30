import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/entities";
import { UserEntity } from "@vivalence/entities";
// import { UserEntity } from "../view/User.ts";

import { SymbolEntity } from "../corpus/Symbol.ts";
import { LiteralEntity } from "../corpus/Literal.ts";
import { MemoryEntity } from "../userspace/Memory.ts";
import { ExerciseEntity } from "../userspace/Exercise.ts";

export class PlayEntity extends BaseEntity {
  user!: Rel<UserEntity>;

  literal?: Rel<LiteralEntity>;
  symbol?: Rel<SymbolEntity>;
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
    literal: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "literal",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },
    symbol: {
      kind: "m:1",
      entity: () => SymbolEntity,
      fieldName: "symbol",
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

export default {
  schema: PlaySchema,
  entity: PlayEntity,
  // repository: TopographyRepository,
};
