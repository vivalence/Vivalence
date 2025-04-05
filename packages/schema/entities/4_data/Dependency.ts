import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseCurriculumEntity, BaseCurriculumSchema } from "../0_root/BaseCurriculumEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { CorpusEntity } from "../2_module/Corpus.ts";
import { ConditionEntity } from "../4_data/Condition.ts";
import { PlayEntity } from "../5_userland/Play.ts";
import { InstructionEntity } from "../6_transient/Instruction.ts";
import { UserEntity } from "../1_repo/User.ts";

export class DependencyEntity extends BaseCurriculumEntity {
  // user!: Rel<UserEntity>;
  runtime!: Rel<RuntimeEntity>;
  corpus?: Rel<CorpusEntity>;
  plays = new Collection<PlayEntity>(this);
  instructions = new Collection<InstructionEntity>(this);

  conditions = new Collection<ConditionEntity>(this);
  preconditions = new Collection<ConditionEntity>(this);

  itinerary: any & Opt = "{}";
  available: boolean & Opt = false;
  satisfied: boolean & Opt = false;

  // TODO
  // availableLastCheckedAt
  // satisfiedLastCheckedAt

  // assessedAt
  // satisfiedAt
}

export const DependencySchema = new EntitySchema<DependencyEntity, BaseCurriculumEntity>({
  class: DependencyEntity,
  extends: BaseCurriculumSchema,
  tableName: "Dependency",
  // must include user
  uniques: [{ properties: ["slug", "runtime"] }],
  properties: {
    // user: {kind: "m:1", entity: () => UserEntity, fieldName: "user", updateRule: "cascade", deleteRule: "cascade",},
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    corpus: {
      kind: "m:1",
      entity: () => CorpusEntity,
      fieldName: "curriculum",
      updateRule: "cascade",
      deleteRule: "set null",
      nullable: true,
    },
    plays: { kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.dependency },
    instructions: {
      kind: "1:m",
      entity: () => InstructionEntity,
      mappedBy: (instruction) => instruction.dependency,
    },
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
    available: { type: "boolean" },
    satisfied: { type: "boolean" },
  },
});
