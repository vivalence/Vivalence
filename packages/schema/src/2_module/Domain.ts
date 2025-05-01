import { EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
// import { RuntimeEntity } from "../1_repo/Runtime.ts";

export class DomainEntity extends BaseModuleEntity {
  // runtime!: Rel<RuntimeEntity>;
}

export const DomainSchema = new EntitySchema<DomainEntity, BaseModuleEntity>({
  class: DomainEntity,
  extends: BaseModuleSchema,
  tableName: "Domain",
  uniques: [{ properties: ["slug"] }],
  // uniques: [{name: "Domain_runtime_key", expression: 'CREATE UNIQUE INDEX "Domain_runtime_key" ON public."Domain" USING btree ("runtime")', properties: ["runtime"],}, {name: "Domain_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Domain_slug_runtime_key" ON public."Domain" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  properties: {
    // runtime: {kind: "1:1", entity: () => RuntimeEntity, updateRule: "cascade", deleteRule: "cascade",},
  },
});
