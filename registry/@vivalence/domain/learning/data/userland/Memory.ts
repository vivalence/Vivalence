import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/entities";
import { UserEntity } from "@vivalence/entities";

import { TagEntity } from "../corpus/Tag.ts";
import { UnitEntity } from "../corpus/Unit.ts";
import { PlayEntity } from "../userland/Play.ts";

export enum MemoryDriverEnum {
  BAYESIAN = "BAYESIAN",
  BOOLEAN = "BOOLEAN",
  AGENTIC = "AGENTIC",
}

export enum MemoryTypeEnum {
  INDIVIDUAL = "INDIVIDUAL",
  RELATIONAL = "RELATIONAL",
}

export enum MemoryStatusEnum {
  UNTOUCHED = "UNTOUCHED",
  UNKNOWN = "UNKNOWN",
  LEARNING = "LEARNING",
  KNOWN = "KNOWN",
  GRADUATED = "GRADUATED",
}

export class MemoryEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  unit?: Rel<UnitEntity>;
  tag?: Rel<TagEntity>;
  plays = new Collection<PlayEntity>(this);

  driver: MemoryDriverEnum & Opt = MemoryDriverEnum.BAYESIAN;
  type: MemoryTypeEnum & Opt = MemoryTypeEnum.INDIVIDUAL;
  status: MemoryStatusEnum & Opt = MemoryStatusEnum.UNKNOWN;

  state: any & Opt = {};
  history: any & Opt = [];
  nextIn!: number & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;
}

export const MemorySchema = new EntitySchema<MemoryEntity, BaseEntity>({
  class: MemoryEntity,
  extends: BaseSchema,
  tableName: "Memory",
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
    plays: {
      kind: "1:m",
      entity: () => PlayEntity,
      mappedBy: (play) => play.memory,
    },

    driver: {
      enum: true,
      items: () => MemoryDriverEnum,
      default: MemoryDriverEnum.BAYESIAN,
      onCreate: () => MemoryDriverEnum.BAYESIAN,
    },
    type: {
      enum: true,
      items: () => MemoryTypeEnum,
      default: MemoryTypeEnum.INDIVIDUAL,
      onCreate: () => MemoryTypeEnum.INDIVIDUAL,
    },
    status: {
      enum: true,
      items: () => MemoryStatusEnum,
      default: MemoryStatusEnum.UNKNOWN,
      onCreate: () => MemoryStatusEnum.UNKNOWN,
    },

    state: { type: "json" },
    history: { type: "json" },

    nextIn: { type: Number, defaultRaw: `0.0`, fieldName: "nextIn" },
    nextAt: { type: Date, fieldName: "nextAt" },
    lastAt: { type: Date, fieldName: "lastAt" },
  },
});
