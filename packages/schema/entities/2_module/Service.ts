import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
// import { RuntimeEntity } from "../1_repo/Runtime.ts";

export enum ServiceTraitsEnum {
  AGENTIC = "AGENTIC",
  _ = "_",
}

export class ServiceEntity extends BaseModuleEntity {
  // runtime!: Rel<RuntimeEntity>;
  traits?: ServiceTraitsEnum[];
  data: any & Opt = "{}";
}

export const ServiceSchema = new EntitySchema<ServiceEntity, BaseModuleEntity>({
  class: ServiceEntity,
  tableName: "Service",
  extends: BaseModuleSchema,
  uniques: [{ properties: ["slug"] }],
  properties: {
    // runtime: {kind: "m:1", entity: () => RuntimeEntity, updateRule: "cascade", deleteRule: "cascade",},
    traits: {
      type: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => ServiceTraitsEnum,
    },
    data: { type: "json" },
  },
});
