import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/typology/entities";
import { UserEntity } from "@vivalence/typology/entities";

import { SymbolEntity } from "../kernel/Symbol.ts";
import { LiteralEntity } from "../kernel/Literal.ts";
import { PlayEntity } from "../userspace/Play.ts";

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
  literal?: Rel<LiteralEntity>;
  symbol?: Rel<SymbolEntity>;
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

export default {
  type: "memory",
  schema: MemorySchema,
  entity: MemoryEntity,
  // repository: TopographyRepository,
};
