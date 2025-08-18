import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/entities";
import { UserEntity, SessionEntity } from "@vivalence/entities";

import { SymbolEntity } from "../corpus/Symbol.ts";
import { UnitEntity } from "../corpus/Unit.ts";
import { PlayEntity } from "../userland/Play.ts";

export enum ExerciseStatusEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DONE = "DONE",
  ERROR = "ERROR",
}

export class ExerciseEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  status: ExerciseStatusEnum & Opt = ExerciseStatusEnum.PENDING;

  index: number & Opt = 0;
  instruction: any & Opt = {};
  producer: any & Opt = {};

  session?: Rel<SessionEntity>;
  symbols = new Collection<SymbolEntity>(this);
  units = new Collection<UnitEntity>(this);

  strategy?: string & Opt = null;
  tactic?: string & Opt = null;
  game?: string & Opt = null;

  plays = new Collection<PlayEntity>(this);
}

export const ExerciseSchema = new EntitySchema<ExerciseEntity, BaseEntity>({
  class: ExerciseEntity,
  extends: BaseSchema,
  tableName: "Exercise",
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    status: {
      enum: true,
      items: () => ExerciseStatusEnum,
      default: ExerciseStatusEnum.PENDING,
      onCreate: () => ExerciseStatusEnum.PENDING,
    },

    index: { type: Number },
    instruction: { type: "json" },
    producer: { type: "json" },

    session: {
      kind: "m:1",
      entity: () => SessionEntity,
      fieldName: "session",
      nullable: true,
    },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      inversedBy: "exercises",
      pivotTable: "_ExerciseToSymbol",
    },

    units: {
      kind: "m:n",
      entity: () => UnitEntity,
      inversedBy: "exercises",
      pivotTable: "_ExerciseToUnit",
    },

    game: { type: "string", nullable: true },
    tactic: { type: "string", nullable: true },
    strategy: { type: "string", nullable: true },

    plays: {
      kind: "1:m",
      entity: () => PlayEntity,
      mappedBy: (play) => play.exercise,
    },
  },
});

export default {
  schema: ExerciseSchema,
  entity: ExerciseEntity,
  // repository: TopographyRepository,
};
