import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Runtime } from "./Runtime.ts";
import { User } from "./User.ts";

export class Strategy extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  name!: string;
  runtimeId!: Rel<Runtime>;
  userId!: Rel<User>;
  slug: string & Opt = "";
  description?: string;
  installed: boolean & Opt = false;
  version: string & Opt = "0.0.0";
  data: any & Opt = "{}";
  traits?: string[];
}

export const StrategySchema = new EntitySchema({
  class: Strategy,
  tableName: "Strategy",
  uniques: [
    {
      name: "Strategy_slug_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Strategy_slug_runtimeId_key" ON public."Strategy" USING btree (slug, "runtimeId")',
      properties: ["slug", "runtimeId"],
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
    name: { type: "text" },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    userId: {
      kind: "m:1",
      entity: () => User,
      fieldName: "userId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    slug: { type: "text" },
    description: { type: "text", nullable: true },
    installed: { type: "boolean" },
    version: { type: "text" },
    data: { type: "json" },
    traits: {
      type: "string[]",
      columnType: "StrategyTraitsEnum[]",
      nullable: true,
      defaultRaw: `ARRAY[]::"StrategyTraitsEnum"[]`,
    },
  },
});
