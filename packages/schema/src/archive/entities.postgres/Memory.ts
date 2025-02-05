import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Play } from "./Play.ts";
import { Runtime } from "./Runtime.ts";
import { Tag } from "./Tag.ts";
import { Unit } from "./Unit.ts";
import { User } from "./User.ts";

export class Memory extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  status: MemoryStatus & Opt = MemoryStatus.UNKNOWN;
  state: any & Opt = "{}";
  history: any & Opt = "[]";
  unitId?: Rel<Unit>;
  userId!: Rel<User>;
  tagId?: Rel<Tag>;
  runtimeId!: Rel<Runtime>;
  lastAt!: Date & Opt;
  nextAt!: Date & Opt;
  nextIn!: string & Opt;
  signal: any & Opt = "{}";
  flavor: MemoryFlavor & Opt = MemoryFlavor.INDIVIDUAL;
  type: string & Opt = "BAYESIAN";
  playCollection = new Collection<Play>(this);
}

export enum MemoryStatus {
  UNKNOWN = "UNKNOWN",
  LEARNING = "LEARNING",
  KNOWN = "KNOWN",
  GRADUATED = "GRADUATED",
  UNTOUCHED = "UNTOUCHED",
}

export enum MemoryFlavor {
  RELATIONAL = "RELATIONAL",
  INDIVIDUAL = "INDIVIDUAL",
}

export const MemorySchema = new EntitySchema({
  class: Memory,
  tableName: "Memory",
  indexes: [
    {
      name: "tagIdIndexOnMemory",
      expression: 'CREATE INDEX "tagIdIndexOnMemory" ON public."Memory" USING btree ("tagId")',
      properties: ["tagId"],
    },
    {
      name: "unitIdIndexOnMemory",
      expression: 'CREATE INDEX "unitIdIndexOnMemory" ON public."Memory" USING btree ("unitId")',
      properties: ["unitId"],
    },
    {
      name: "userIdIndexOnMemory",
      expression: 'CREATE INDEX "userIdIndexOnMemory" ON public."Memory" USING btree ("userId")',
      properties: ["userId"],
    },
  ],
  uniques: [
    {
      name: "Memory_unitId_userId_tagId_key",
      expression:
        'CREATE UNIQUE INDEX "Memory_unitId_userId_tagId_key" ON public."Memory" USING btree ("unitId", "userId", "tagId")',
      properties: ["unitId", "userId", "tagId"],
    },
  ],
  properties: {
    id: { primary: true, type: "text", defaultRaw: `uuid_generate_v4()` },
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
    status: { enum: true, items: () => MemoryStatus },
    state: { type: "json" },
    history: { type: "json" },
    unitId: {
      kind: "m:1",
      entity: () => Unit,
      fieldName: "unitId",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
      index: "unitIdIndexOnMemory",
    },
    userId: {
      kind: "m:1",
      entity: () => User,
      fieldName: "userId",
      updateRule: "cascade",
      deleteRule: "cascade",
      index: "userIdIndexOnMemory",
    },
    tagId: {
      kind: "m:1",
      entity: () => Tag,
      fieldName: "tagId",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
      index: "tagIdIndexOnMemory",
    },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    lastAt: {
      type: "datetime",
      fieldName: "lastAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    nextAt: {
      type: "datetime",
      fieldName: "nextAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    nextIn: {
      type: "decimal",
      fieldName: "nextIn",
      precision: 65,
      scale: 30,
      defaultRaw: `0.0`,
    },
    signal: { type: "json" },
    flavor: { enum: true, items: () => MemoryFlavor },
    type: { type: "text" },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "memoryId" },
  },
});
