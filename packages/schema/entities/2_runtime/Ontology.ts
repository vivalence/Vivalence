import { EntitySchema, Collection, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { TagEntity } from "../3_curriculum/Tag.ts";

export class OntologyEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  tags = new Collection<TagEntity>(this);
}

export const OntologySchema = new EntitySchema<OntologyEntity, BaseModuleEntity>({
  class: OntologyEntity,
  extends: BaseModuleSchema,
  tableName: "Ontology",
  uniques: [{ properties: ["slug", "runtime"] }],
  properties: {
    runtime: {
      kind: "1:1",
      entity: () => RuntimeEntity,
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    tags: {
      kind: "1:m",
      entity: () => TagEntity,
      mappedBy: "ontology",
    },
  },
});
