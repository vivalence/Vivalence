import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { Tenants } from "./Tenants.ts";

export class Extensions extends BaseModuleEntity {
  id!: string;
  type?: string;
  settings?: any;
  tenant?: Rel<Tenants>;
  insertedAt!: Date;
  updatedAt!: Date;
}

export const ExtensionsSchema = new EntitySchema({
  class: Extensions,
  schema: "_realtime",
  uniques: [
    {
      name: "extensions_tenant_external_id_type_index",
      properties: ["tenant", "type"],
    },
  ],
  properties: {
    id: { primary: true, type: "uuid" },
    type: { type: "text", nullable: true },
    settings: { type: "json", nullable: true },
    tenant: {
      kind: "m:1",
      entity: () => Tenants,
      deleteRule: "cascade",
      nullable: true,
    },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
  },
});
