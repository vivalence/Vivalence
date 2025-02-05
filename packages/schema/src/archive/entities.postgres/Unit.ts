import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Corpus } from "./Corpus.ts";
import { Memory } from "./Memory.ts";
import { Play } from "./Play.ts";
import { Runtime } from "./Runtime.ts";
import { TagToUnit } from "./TagToUnit.ts";

export class Unit extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  data: any & Opt = "{}";
  annotation: any & Opt = "{}";
  runtimeId!: Rel<Runtime>;
  slug!: string;
  corpusId?: Rel<Corpus>;
  index?: number;
  tagToUnitCollection = new Collection<TagToUnit>(this);
  memoryCollection = new Collection<Memory>(this);
  playCollection = new Collection<Play>(this);
}

export const UnitSchema = new EntitySchema({
  class: Unit,
  tableName: "Unit",
  uniques: [
    {
      name: "Unit_slug_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Unit_slug_runtimeId_key" ON public."Unit" USING btree (slug, "runtimeId")',
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
    data: { type: "json" },
    annotation: { type: "json" },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    slug: { type: "text" },
    corpusId: {
      kind: "m:1",
      entity: () => Corpus,
      fieldName: "corpusId",
      updateRule: "cascade",
      deleteRule: "set null",
      nullable: true,
    },
    index: { type: "integer", nullable: true },
    tagToUnitCollection: { kind: "1:m", entity: () => TagToUnit, mappedBy: "B" },
    memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "unitId" },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "unitId" },
  },
});
