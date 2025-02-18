import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Corpus } from "./Corpus.ts";
import { Runtime } from "./Runtime.ts";

export class PublicCondition extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeId!: Rel<Runtime>;
  corpusId?: Rel<Corpus>;
  scope: any & Opt = "{}";
  assertion: any & Opt = "{}";
  met: boolean & Opt = false;
  description?: string;
  name?: string;
}

export const PublicConditionSchema = new EntitySchema({
  class: PublicCondition,
  tableName: "Condition",
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
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    corpusId: {
      kind: "m:1",
      entity: () => Corpus,
      fieldName: "corpusId",
      updateRule: "cascade",
      deleteRule: "set null",
      nullable: true,
    },
    scope: { type: "json" },
    assertion: { type: "json" },
    met: { type: "boolean" },
    description: { type: "text", nullable: true },
    name: { type: "text", nullable: true },
  },
});
