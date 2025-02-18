import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Runtime } from "./Runtime.ts";

export class Domain extends BaseModuleEntity {
  id!: string & Opt;
  slug!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  name?: string;
  version: string & Opt = "0.0.0";
  installed: boolean & Opt = false;
  runtimeId!: Rel<Runtime>;
  description?: string;
}

export const DomainSchema = new EntitySchema({
  class: Domain,
  tableName: "Domain",
  uniques: [
    {
      name: "Domain_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Domain_runtimeId_key" ON public."Domain" USING btree ("runtimeId")',
      properties: ["runtimeId"],
    },
    {
      name: "Domain_slug_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Domain_slug_runtimeId_key" ON public."Domain" USING btree (slug, "runtimeId")',
      properties: ["slug", "runtimeId"],
    },
  ],
  properties: {
    id: { primary: true, type: "text", defaultRaw: `uuid_generate_v4()` },
    slug: { type: "text" },
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
    name: { type: "text", nullable: true },
    version: { type: "text" },
    installed: { type: "boolean" },
    runtimeId: {
      kind: "1:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
      unique: "Domain_runtimeId_key",
    },
    description: { type: "text", nullable: true },
  },
});
