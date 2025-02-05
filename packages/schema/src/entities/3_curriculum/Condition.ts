import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";
import { Dependency } from "../3_curriculum/Dependency.ts";
import { Runtime } from "../1_repo/Runtime.ts";
import { User } from "../0_root/User.ts";

export class Condition extends BaseModuleEntity {
  id!: string;
  name?: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  user!: Rel<User>;
  runtime!: Rel<Runtime>;
  curriculum?: Rel<CurriculumEntity>;
  scope: any & Opt = "{}";
  assertion: any & Opt = "{}";
  met: boolean & Opt = false;
  ConditionRelation = new Collection<Dependency>(this);
  PreconditionRelation = new Collection<Dependency>(this);
}

export const ConditionSchema = new EntitySchema({
  class: Condition,
  tableName: "Condition",
  properties: {
    id: { primary: true, type: "text" },
    name: { type: "text", nullable: true },
    description: { type: "text", nullable: true },
    createdAt: {
      type: "datetime",
      fieldName: "createdAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    updatedAt: {
      type: "datetime",
      fieldName: "updatedAt",
      columnType: "timestamp(3)",
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    user: {
      kind: "m:1",
      entity: () => User,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    runtime: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    curriculum: {
      kind: "m:1",
      entity: () => CurriculumEntity,
      fieldName: "curriculum",
      updateRule: "cascade",
      deleteRule: "set null",
      nullable: true,
    },
    scope: { type: "json" },
    assertion: { type: "json" },
    met: { type: "boolean" },
    ConditionRelation: {
      kind: "m:n",
      entity: () => Dependency,
      pivotTable: "_ConditionRelation",
      joinColumn: "A",
      inverseJoinColumn: "B",
    },
    PreconditionRelation: {
      kind: "m:n",
      entity: () => Dependency,
      pivotTable: "_PreconditionRelation",
      joinColumn: "A",
      inverseJoinColumn: "B",
    },
  },
});
