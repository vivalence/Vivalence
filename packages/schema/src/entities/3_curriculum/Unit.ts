import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";
import { Memory } from "../4_userland/Memory.ts";
import { Play } from "../4_userland/Play.ts";
import { Runtime } from "../1_repo/Runtime.ts";
import { Tag } from "../3_curriculum/Tag.ts";

export class Unit extends BaseModuleEntity {
  id!: string;
  slug!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtime!: Rel<Runtime>;
  curriculum?: Rel<CurriculumEntity>;
  annotation: any & Opt = "{}";
  data: any & Opt = "{}";
  index?: number;
  memoryCollection = new Collection<Memory>(this);
  playCollection = new Collection<Play>(this);
  TagToUnitInverse = new Collection<Tag>(this);
}

export const UnitSchema = new EntitySchema({
  class: Unit,
  tableName: "Unit",
  uniques: [
    {
      name: "Unit_slug_runtime_key",
      expression:
        'CREATE UNIQUE INDEX "Unit_slug_runtime_key" ON public."Unit" USING btree (slug, "runtime")',
      properties: ["slug", "runtime"],
    },
  ],
  properties: {
    id: { primary: true, type: "text" },
    slug: { type: "text" },
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
    annotation: { type: "json" },
    data: { type: "json" },
    index: { type: "integer", nullable: true },
    memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "unit" },
    playCollection: { kind: "1:m", entity: () => Play, mappedBy: "unit" },
    TagToUnitInverse: { kind: "m:n", entity: () => Tag, mappedBy: "TagToUnit" },
  },
});
