import { ModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";

export class OntologyEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
}

export const OntologySchema = new EntitySchema<OntologyEntity, BaseModuleEntity>({
  class: OntologyEntity,
  extends: BaseModuleSchema,
  tableName: "Ontology",
  // uniques: [{name: "Ontology_runtime_key", expression: 'CREATE UNIQUE INDEX "Ontology_runtime_key" ON public."Ontology" USING btree ("runtime")', properties: ["runtime"],}, {name: "Ontology_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Ontology_slug_runtime_key" ON public."Ontology" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  properties: {
    runtime: {
      kind: "1:1",
      entity: () => RuntimeEntity,
      updateRule: "cascade",
      deleteRule: "cascade",
    },
  },
});
