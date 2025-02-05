import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";
import { Memory } from "../4_userland/Memory.ts";
import { Play } from "../4_userland/Play.ts";
import { Runtime } from "../1_repo/Runtime.ts";
import { Unit } from "../3_curriculum/Unit.ts";

export class Tag extends BaseModuleEntity {
  id!: string;
  slug!: string;
  name!: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtime!: Rel<Runtime>;
  curriculum?: Rel<CurriculumEntity>;
  traits?: string[];
  data: any & Opt = "{}";
  TagToUnit = new Collection<Unit>(this);
  memoryCollection = new Collection<Memory>(this);
  playCollection = new Collection<Play>(this);
}

export const TagSchema = new EntitySchema({
  class: Tag,
  tableName: "Tag",
  uniques: [
    {
      name: "Tag_slug_runtime_key",
      expression:
        'CREATE UNIQUE INDEX "Tag_slug_runtime_key" ON public."Tag" USING btree (slug, "runtime")',
      properties: ["slug", "runtime"],
    },
  ],
  properties: {
    id: { primary: true, type: "text" },
    slug: { type: "text" },
    name: { type: "text", index: "nameIndexOnTag" },
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
    traits: {
      type: "string[]",
      columnType: "TagTraitsEnum[]",
      nullable: true,
      defaultRaw: `ARRAY[]::"TagTraitsEnum"[]`,
    },
    data: { type: "json" },
    TagToUnit: {
      kind: "m:n",
      entity: () => Unit,
      pivotTable: "_TagToUnit",
      joinColumn: "A",
      inverseJoinColumn: "B",
    },
    memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "tag" },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "tag" },
  },
});
