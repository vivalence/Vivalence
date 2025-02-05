import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Corpus } from "./Corpus.ts";
import { Precondition } from "./Precondition.ts";
import { PublicCondition } from "./PublicCondition.ts";
import { Queue } from "./Queue.ts";
import { Runtime } from "./Runtime.ts";

export class Dependency extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  slug!: string;
  name!: string;
  description?: string;
  runtimeId!: Rel<Runtime>;
  corpusId?: Rel<Corpus>;
  satisfied: boolean & Opt = false;
  itinerary: any & Opt = "{}";
  available: boolean & Opt = false;
  publicConditionCollection = new Collection<PublicCondition>(this);
  preconditionCollection = new Collection<Precondition>(this);
  queueCollection = new Collection<Queue>(this);
}

export const DependencySchema = new EntitySchema({
  class: Dependency,
  tableName: "Dependency",
  uniques: [
    {
      name: "Dependency_slug_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Dependency_slug_runtimeId_key" ON public."Dependency" USING btree (slug, "runtimeId")',
      properties: ["slug", "runtimeId"],
    },
  ],
  properties: {
    id: { primary: true, type: "text", defaultRaw: `uuid_generate_v4()` },
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
    slug: { type: "text" },
    name: { type: "text" },
    description: { type: "text", nullable: true },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    corpusId: {
      kind: "m:1",
      entity: () => Corpus,
      fieldName: "corpusId",
      updateRule: "cascade",
      deleteRule: "set null",
      nullable: true,
    },
    satisfied: { type: "boolean" },
    itinerary: { type: "json" },
    available: { type: "boolean" },
    publicConditionCollection: {
      kind: "1:m",
      entity: () => PublicCondition,
      mappedBy: "B",
    },
    preconditionCollection: {
      kind: "1:m",
      entity: () => Precondition,
      mappedBy: "B",
    },
    queueCollection: {
      kind: "1:m",
      entity: () => Queue,
      mappedBy: "dependencyId",
    },
  },
});
