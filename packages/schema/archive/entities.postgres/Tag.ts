import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { Corpus } from "./Corpus.ts";
import { Memory } from "./Memory.ts";
import { Play } from "./Play.ts";
import { Runtime } from "./Runtime.ts";
import { TagToUnit } from "./TagToUnit.ts";

export class Tag extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  name!: string;
  data: any & Opt = "{}";
  runtimeId!: Rel<Runtime>;
  traits?: string[];
  slug!: string;
  corpusId?: Rel<Corpus>;
  description?: string;
  tagToUnitCollection = new Collection<TagToUnit>(this);
  memoryCollection = new Collection<Memory>(this);
  playCollection = new Collection<Play>(this);
}

export const TagSchema = new EntitySchema({
  class: Tag,
  tableName: "Tag",
  uniques: [
    {
      name: "Tag_slug_runtimeId_key",
      expression:
        'CREATE UNIQUE INDEX "Tag_slug_runtimeId_key" ON public."Tag" USING btree (slug, "runtimeId")',
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
    name: { type: "text", index: "nameIndexOnTag" },
    data: { type: "json" },
    runtimeId: {
      kind: "m:1",
      entity: () => Runtime,
      fieldName: "runtimeId",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    traits: {
      type: "string[]",
      columnType: "TagTraitsEnum[]",
      nullable: true,
      defaultRaw: `ARRAY[]::"TagTraitsEnum"[]`,
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
    description: { type: "text", nullable: true },
    tagToUnitCollection: { kind: "1:m", entity: () => TagToUnit, mappedBy: "A" },
    memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "tagId" },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "tagId" },
  },
});
