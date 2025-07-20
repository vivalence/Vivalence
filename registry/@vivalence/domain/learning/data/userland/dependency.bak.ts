import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseDataEntity, BaseDataSchema } from "@vivalence/entities";
import { UserEntity } from "@vivalence/entities";

import { ConditionEntity } from "../corpus/Condition.ts";
import { PlayEntity } from "../userland/Play.ts";

export class DependencyEntity extends BaseDataEntity {
  user!: Rel<UserEntity>;

  conditions = new Collection<ConditionEntity>(this);
  preconditions = new Collection<ConditionEntity>(this);

  itinerary: any & Opt = {};

  // available: boolean & Opt = false;
  // satisfied: boolean & Opt = false;

  // plays = new Collection<PlayEntity>(this);
  // TODO
  // availableLastCheckedAt
  // satisfiedLastCheckedAt

  // assessedAt
  // satisfiedAt
}

export const DependencySchema = new EntitySchema<
  DependencyEntity,
  BaseDataEntity
>({
  class: DependencyEntity,
  extends: BaseDataSchema,
  tableName: "Dependency",
  // must include user
  uniques: [{ properties: ["slug"] }],
  properties: {
    // user: {kind: "m:1", entity: () => UserEntity, fieldName: "user", updateRule: "cascade", deleteRule: "cascade",},
    // plays: {kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.dependency,},
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
    itinerary: { type: "json" },
    // available: { type: "boolean" },
    // satisfied: { type: "boolean" },
  },
});
