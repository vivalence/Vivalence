import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Play } from "../4_userland/Play.ts";
import { Runtime } from "../1_repo/Runtime.ts";
import { Tag } from "../3_curriculum/Tag.ts";
import { Unit } from "../3_curriculum/Unit.ts";
import { User } from "../0_root/User.ts";

export class Memory extends BaseModuleEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  user!: Rel<User>;
  runtime!: Rel<Runtime>;
  tag?: Rel<Tag>;
  unit?: Rel<Unit>;
  type: string & Opt = "BAYESIAN";
  flavor: MemoryFlavor & Opt = MemoryFlavor.INDIVIDUAL;
  status: MemoryStatus & Opt = MemoryStatus.UNKNOWN;
  state: any & Opt = "{}";
  history: any & Opt = "[]";
  signal: any & Opt = "{}";
  nextIn!: string & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;
  playCollection = new Collection<Play>(this);
}

export enum MemoryFlavor {
  INDIVIDUAL = "INDIVIDUAL",
  RELATIONAL = "RELATIONAL",
}

export enum MemoryStatus {
  UNTOUCHED = "UNTOUCHED",
  UNKNOWN = "UNKNOWN",
  LEARNING = "LEARNING",
  KNOWN = "KNOWN",
  GRADUATED = "GRADUATED",
}

export const MemorySchema = new EntitySchema({
  class: Memory,
  tableName: "Memory",
  indexes: [
    {
      name: "tagIndexOnMemory",
      expression: 'CREATE INDEX "tagIndexOnMemory" ON public."Memory" USING btree ("tag")',
      properties: ["tag"],
    },
    {
      name: "unitIndexOnMemory",
      expression: 'CREATE INDEX "unitIndexOnMemory" ON public."Memory" USING btree ("unit")',
      properties: ["unit"],
    },
    {
      name: "userIndexOnMemory",
      expression: 'CREATE INDEX "userIndexOnMemory" ON public."Memory" USING btree ("user")',
      properties: ["user"],
    },
  ],
  uniques: [
    {
      name: "Memory_unit_user_tag_key",
      expression:
        'CREATE UNIQUE INDEX "Memory_unit_user_tag_key" ON public."Memory" USING btree ("unit", "user", "tag")',
      properties: ["unit", "user", "tag"],
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
      index: "userIndexOnMemory",
    },
    runtime: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    tag: {
      kind: "m:1",
      entity: () => Tag,
      fieldName: "tag",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
      index: "tagIndexOnMemory",
    },
    unit: {
      kind: "m:1",
      entity: () => Unit,
      fieldName: "unit",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
      index: "unitIndexOnMemory",
    },
    type: { type: "text" },
    flavor: { enum: true, items: () => MemoryFlavor },
    status: { enum: true, items: () => MemoryStatus },
    state: { type: "json" },
    history: { type: "json" },
    signal: { type: "json" },
    nextIn: { type: "decimal", fieldName: "nextIn", precision: 65, scale: 30, defaultRaw: `0.0` },
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
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "memory" },
  },
});
