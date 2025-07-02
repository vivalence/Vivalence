import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import {
  BaseModuleEntity,
  BaseModuleSchema,
} from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_system/Runtime.ts";

export enum ModuleTraitsEnum {
  ONTOLOGICAL = "ONTOLOGICAL",
  CURRICULAR = "CURRICULAR",
  DATASET = "DATASET",
  AGENTIC = "AGENTIC",
  _ = "_",
  // any:any
}

export class ModuleEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  traits?: ModuleTraitsEnum[];
  type?: string;
}

export const ModuleSchema = new EntitySchema<ModuleEntity, BaseModuleEntity>({
  class: ModuleEntity,
  tableName: "Module",
  extends: BaseModuleSchema,
  uniques: [{ properties: ["runtime", "slug"] }],
  properties: {
    type: { type: String, nullable: true },
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    traits: {
      type: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => ModuleTraitsEnum,
    },
  },
});
