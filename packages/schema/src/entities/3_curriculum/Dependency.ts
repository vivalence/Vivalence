import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Condition } from "../3_curriculum/Condition.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";
import { Play } from "../4_userland/Play.ts";
import { Queue } from "../5_transient/Queue.ts";
import { Runtime } from "../1_repo/Runtime.ts";
import { User } from "../0_root/User.ts";

export class Dependency extends BaseModuleEntity {
  id!: string;
  slug!: string;
  name!: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  user!: Rel<User>;
  runtime!: Rel<Runtime>;
  curriculum?: Rel<CurriculumEntity>;
  itinerary: any & Opt = "{}";
  available: boolean & Opt = false;
  satisfied: boolean & Opt = false;
  ConditionRelationInverse = new Collection<Condition>(this);
  PreconditionRelationInverse = new Collection<Condition>(this);
  playCollection = new Collection<Play>(this);
  queueCollection = new Collection<Queue>(this);
}

export const DependencySchema = new EntitySchema({
  class: Dependency,
  tableName: "Dependency",
  uniques: [
    {
      name: "Dependency_slug_runtime_key",
      expression:
        'CREATE UNIQUE INDEX "Dependency_slug_runtime_key" ON public."Dependency" USING btree (slug, "runtime")',
      properties: ["slug", "runtime"],
    },
  ],
  properties: {
    id: { primary: true, type: "text" },
    slug: { type: "text" },
    name: { type: "text" },
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
    itinerary: { type: "json" },
    available: { type: "boolean" },
    satisfied: { type: "boolean" },
    ConditionRelationInverse: {
      kind: "m:n",
      entity: () => Condition,
      mappedBy: "ConditionRelation",
    },
    PreconditionRelationInverse: {
      kind: "m:n",
      entity: () => Condition,
      mappedBy: "PreconditionRelation",
    },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "dependency" },
    queueCollection: {
      kind: "1:m",
      entity: () => Queue,
      mappedBy: "dependency",
    },
  },
});
