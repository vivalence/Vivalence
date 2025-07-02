import { Collection, EntitySchema, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../0_root/BaseEntity.ts";
import { ModuleEntity } from "../2_runtime/Module.ts";

export class RuntimeEntity extends BaseEntity {
  slug: string & Opt = "";
  modules = new Collection<ModuleEntity>(this);
  // domain, services, valences, daemon, ?users?
}

export const RuntimeSchema = new EntitySchema<RuntimeEntity, BaseEntity>({
  class: RuntimeEntity,
  extends: BaseSchema,
  tableName: "Runtime",
  uniques: [{ properties: ["slug"] }],
  properties: {
    slug: { type: String },
    modules: {
      kind: "1:m",
      entity: () => ModuleEntity,
      mappedBy: (module) => module.runtime,
    },
  },
});
