import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/schema";
import { UserEntity } from "@vivalence/schema";

import { PlayEntity } from "../5_userland/Play.ts";

import { TagEntity } from "../4_data/Tag.ts";
import { UnitEntity } from "../4_data/Unit.ts";

// traits: [Agentic]
export enum MemoryTypeEnum {
  BAYESIAN = "BAYESIAN",
  BOOLEAN = "BOOLEAN",
  AGENTIC = "AGENTIC",
}

export enum MemoryFlavorEnum {
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
  // runtime!: Rel<RuntimeEntity>;
  unit?: Rel<UnitEntity>;
  tag?: Rel<TagEntity>;
  plays = new Collection<PlayEntity>(this);

  type: MemoryTypeEnum & Opt = MemoryTypeEnum.BAYESIAN;
  flavor: MemoryFlavorEnum & Opt = MemoryFlavorEnum.INDIVIDUAL;
  status: MemoryStatusEnum & Opt = MemoryStatusEnum.UNKNOWN;

  state: any & Opt = "{}";
  history: any & Opt = "[]";
  signal: any & Opt = "{}";
  nextIn!: number & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;
}

export const MemorySchema = new EntitySchema<MemoryEntity, BaseEntity>({
  class: MemoryEntity,
  extends: BaseSchema,
  tableName: "Memory",
  // indexes: [{name: "tagIndexOnMemory", expression: 'CREATE INDEX "tagIndexOnMemory" ON public."Memory" USING btree ("tag")', properties: ["tag"],}, {name: "unitIndexOnMemory", expression: 'CREATE INDEX "unitIndexOnMemory" ON public."Memory" USING btree ("unit")', properties: ["unit"],}, {name: "userIndexOnMemory", expression: 'CREATE INDEX "userIndexOnMemory" ON public."Memory" USING btree ("user")', properties: ["user"],},],
  // uniques: [{ properties: ["unit", "tag", "runtime"] }],
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    // runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",},
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
    plays: { kind: "1:m", entity: () => PlayEntity, mappedBy: "memory" },

    type: {
      enum: true,
      items: () => MemoryTypeEnum,
      default: MemoryTypeEnum.BAYESIAN,
      onCreate: () => MemoryTypeEnum.BAYESIAN,
    },
    flavor: {
      enum: true,
      items: () => MemoryFlavorEnum,
      default: MemoryFlavorEnum.INDIVIDUAL,
      onCreate: () => MemoryFlavorEnum.INDIVIDUAL,
    },
    status: {
      enum: true,
      items: () => MemoryStatusEnum,
      default: MemoryStatusEnum.UNKNOWN,
      onCreate: () => MemoryStatusEnum.UNKNOWN,
    },

    state: { type: "json" },
    history: { type: "json" },
    signal: { type: "json" },

    nextIn: { type: Number, defaultRaw: `0.0`, fieldName: "nextIn" },
    nextAt: { type: Date, lazy: true, fieldName: "nextAt" },
    lastAt: { type: Date, lazy: true, fieldName: "lastAt" },
  },
});
