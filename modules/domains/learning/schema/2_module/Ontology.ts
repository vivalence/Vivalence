import { EntitySchema, Collection, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "@vivalence/schema";
import { RuntimeEntity } from "@vivalence/schema";

import { TagEntity } from "../4_data/Tag.ts";

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
