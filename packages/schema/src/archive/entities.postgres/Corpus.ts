import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Dependency } from "./Dependency.ts";
import { PublicCondition } from "./PublicCondition.ts";
import { Runtime } from "./Runtime.ts";
import { Tag } from "./Tag.ts";
import { Unit } from "./Unit.ts";

export class Corpus extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  name?: string;
  version: string & Opt = "0.0.0";
  installed: boolean & Opt = false;
  slug!: string;
  runtimeId!: Rel<Runtime>;
  description?: string;
  icon?: any;
  publicConditionCollection = new Collection<PublicCondition>(this);
  dependencyCollection = new Collection<Dependency>(this);
  tagCollection = new Collection<Tag>(this);
  unitCollection = new Collection<Unit>(this);
}

export const CorpusSchema = new EntitySchema({
  class: Corpus,
  tableName: "Corpus",
  uniques: [
    {
      name: "Corpus_slug_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Corpus_slug_runtimeId_key" ON public."Corpus" USING btree (slug, "runtimeId")',
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
    name: { type: "text", nullable: true },
    version: { type: "text" },
    installed: { type: "boolean" },
    slug: { type: "text" },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    description: { type: "text", nullable: true },
    icon: { type: "json", nullable: true },
    publicConditionCollection: {
      kind: "1:m",
      entity: () => PublicCondition,
      mappedBy: "corpusId",
    },
    dependencyCollection: {
      kind: "1:m",
      entity: () => Dependency,
      mappedBy: "corpusId",
    },
    tagCollection: { kind: "1:m", entity: () => Tag, mappedBy: "corpusId" },
    unitCollection: { kind: "1:m", entity: () => Unit, mappedBy: "corpusId" },
  },
});
