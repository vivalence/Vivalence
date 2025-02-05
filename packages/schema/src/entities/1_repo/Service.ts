import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";

export enum ServiceTraitsEnum {
  _ = "_",
}

export class ServiceEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  traits?: ServiceTraitsEnum[];
  data: any & Opt = "{}";
}

export const ServiceSchema = new EntitySchema<ServiceEntity, BaseModuleEntity>({
  class: ServiceEntity,
  tableName: "Service",
  extends: BaseModuleSchema,
  // uniques: [{name: "Service_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Service_slug_runtime_key" ON public."Service" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  properties: {
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    traits: {
      columnType: "JSONB",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => ServiceTraitsEnum,
    },
    data: { type: "unknown", columnType: "JSONB", defaultRaw: `"{}"` },
  },
});
