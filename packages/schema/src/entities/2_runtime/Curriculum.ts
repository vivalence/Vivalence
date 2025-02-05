import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { UserEntity } from "../0_root/User.ts";

export class CurriculumEntity extends BaseModuleEntity {
  users = new Collection<UserEntity>(this);
  runtime!: Rel<RuntimeEntity>;
}

export const CurriculumSchema = new EntitySchema<CurriculumEntity, BaseModuleEntity>({
  class: CurriculumEntity,
  extends: BaseModuleSchema,
  tableName: "Curriculum",
  // uniques: [{name: "Curriculum_slug_runtime_key", expression: 'CREATE UNIQUE INDEX "Curriculum_slug_runtime_key" ON public."Curriculum" USING btree (slug, "runtime")', properties: ["slug", "runtime"],},],
  properties: {
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    users: {
      kind: "m:n",
      entity: () => UserEntity,
      inversedBy: "curricula",
      pivotTable: "_CurriculumToUser",
    },
  },
});

// import { Condition } from "../3_curriculum/Condition.ts";
// import { Dependency } from "../3_curriculum/Dependency.ts";
// import { RuntimeEntity } from "../1_repo/Runtime.ts";
// import { Tag } from "../3_curriculum/Tag.ts";
// import { Unit } from "../3_curriculum/Unit.ts";
// conditionCollection = new Collection<Condition>(this);
// dependencyCollection = new Collection<Dependency>(this);
// tagCollection = new Collection<Tag>(this);
// unitCollection = new Collection<Unit>(this);
// user: {kind: "m:1", entity: () => User, fieldName: "user", updateRule: "cascade", deleteRule: "set null", nullable: true,},
// conditionCollection: {
//   kind: "1:m",
//   entity: () => Condition,
//   mappedBy: "curriculum",
// },
// dependencyCollection: {
//   kind: "1:m",
//   entity: () => Dependency,
//   mappedBy: "curriculum",
// },
// tagCollection: { kind: "1:m", entity: () => Tag, mappedBy: "curriculum" },
// unitCollection: { kind: "1:m", entity: () => Unit, mappedBy: "curriculum" },
