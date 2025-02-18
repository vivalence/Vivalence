import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { UserEntity } from "../0_root/User.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { TagEntity } from "../3_curriculum/Tag.ts";
import { UnitEntity } from "../3_curriculum/Unit.ts";
import { DependencyEntity } from "../3_curriculum/Dependency.ts";
import { ConditionEntity } from "../3_curriculum/Condition.ts";

export class CurriculumEntity extends BaseModuleEntity {
  users = new Collection<UserEntity>(this);
  runtime!: Rel<RuntimeEntity>;
  units = new Collection<UnitEntity>(this);
  tags = new Collection<TagEntity>(this);
  dependencies = new Collection<DependencyEntity>(this);
  conditions = new Collection<ConditionEntity>(this);
}

export const CurriculumSchema = new EntitySchema<CurriculumEntity, BaseModuleEntity>({
  class: CurriculumEntity,
  extends: BaseModuleSchema,
  tableName: "Curriculum",
  // uniques: [{name: "Curriculum_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Curriculum_slug_runtime_key" ON public."Curriculum" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  uniques: [{ properties: ["slug", "runtime"] }],
  properties: {
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      inversedBy: (runtime) => runtime.curricula,
    },
    users: { kind: "m:n", entity: () => UserEntity, mappedBy: "curricula" },
    units: { kind: "1:m", entity: () => UnitEntity, mappedBy: "curriculum" },
    tags: { kind: "1:m", entity: () => TagEntity, mappedBy: "curriculum" },
    dependencies: { kind: "1:m", entity: () => DependencyEntity, mappedBy: "curriculum" },
    conditions: { kind: "1:m", entity: () => ConditionEntity, mappedBy: "curriculum" },
  },
});
