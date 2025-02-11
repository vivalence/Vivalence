import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseCurriculumEntity, BaseCurriculumSchema } from "../0_root/BaseCurriculumEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";

import { ConditionEntity } from "../3_curriculum/Condition.ts";
// import { Play } from "../4_userland/Play.ts";
// import { Queue } from "../5_transient/Queue.ts";
// import { Runtime } from "../1_repo/Runtime.ts";
// import { User } from "../0_root/User.ts";

export class DependencyEntity extends BaseCurriculumEntity {
  runtime!: Rel<RuntimeEntity>;
  curriculum?: Rel<CurriculumEntity>;
  itinerary: any & Opt = "{}";
  available: boolean & Opt = false;
  satisfied: boolean & Opt = false;
  conditions = new Collection<ConditionEntity>(this);
  preconditions = new Collection<ConditionEntity>(this);

  // playCollection = new Collection<Play>(this);
  // queueCollection = new Collection<Queue>(this);
  // user!: Rel<User>;
}

export const DependencySchema = new EntitySchema<DependencyEntity, BaseCurriculumEntity>({
  class: DependencyEntity,
  extends: BaseCurriculumSchema,
  tableName: "Dependency",
  // must include user
  uniques: [{ properties: ["slug", "runtime"] }],
  properties: {
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
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
    // does the dependency apply the tactic?
    // agency might ought to flow a different way.
    itinerary: { type: "json" },
    available: { type: "boolean" },
    satisfied: { type: "boolean" },
    conditions: {
      kind: "m:n",
      entity: () => ConditionEntity,
      inversedBy: "isConditionTo",
      pivotTable: "_DependencyToCondition",
    },
    preconditions: {
      kind: "m:n",
      entity: () => ConditionEntity,
      inversedBy: "isPreconditionTo",
      pivotTable: "_DependencyToPrecondition",
    },

    // indicates ownership
    // user: {kind: "m:1", entity: () => User, fieldName: "user", updateRule: "cascade", deleteRule: "cascade",},
    // playCollection: { kind: "1:m", entity: () => Play, mappedBy: "dependency" },
    // queueCollection: {
    //   kind: "1:m",
    //   entity: () => Queue,
    //   mappedBy: "dependency",
    // },
  },
});
