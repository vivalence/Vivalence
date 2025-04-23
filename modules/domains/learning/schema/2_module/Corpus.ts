import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "@vivalence/schema";
import { UserEntity } from "@vivalence/schema";
import { RuntimeEntity } from "@vivalence/schema";

import { TagEntity } from "../4_data/Tag.ts";
import { UnitEntity } from "../4_data/Unit.ts";
import { DependencyEntity } from "../4_data/Dependency.ts";
import { ConditionEntity } from "../4_data/Condition.ts";

export class CorpusEntity extends BaseModuleEntity {
  users = new Collection<UserEntity>(this);
  runtime!: Rel<RuntimeEntity>;
  units = new Collection<UnitEntity>(this);
  tags = new Collection<TagEntity>(this);
  dependencies = new Collection<DependencyEntity>(this);
  conditions = new Collection<ConditionEntity>(this);
}

export const CorpusSchema = new EntitySchema<CorpusEntity, BaseModuleEntity>({
  class: CorpusEntity,
  extends: BaseModuleSchema,
  tableName: "Corpus",
  // uniques: [{name: "Curriculum_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Curriculum_slug_runtime_key" ON public."Curriculum" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  uniques: [{ properties: ["slug", "runtime"] }],
  properties: {
    users: { kind: "m:n", entity: () => UserEntity, pivotTable: "_CorpusToUser" },
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      // inversedBy: (runtime) => runtime.corpora,
    },

    units: { kind: "1:m", entity: () => UnitEntity, mappedBy: "corpus" },
    tags: { kind: "1:m", entity: () => TagEntity, mappedBy: "corpus" },
    dependencies: { kind: "1:m", entity: () => DependencyEntity, mappedBy: "corpus" },
    conditions: { kind: "1:m", entity: () => ConditionEntity, mappedBy: "corpus" },
  },
});
