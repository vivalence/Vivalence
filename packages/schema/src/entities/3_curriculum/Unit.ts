import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";

// import { Memory } from "../4_userland/Memory.ts";
// import { Play } from "../4_userland/Play.ts";
// import { Runtime } from "../1_repo/Runtime.ts";
// import { Tag } from "../3_curriculum/Tag.ts";

export class UnitEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  curriculum?: Rel<CurriculumEntity>;
  annotation: any & Opt = "{}";
  data: any & Opt = "{}";
  index?: number;
  // TagToUnitInverse = new Collection<Tag>(this);
  // memoryCollection = new Collection<Memory>(this);
  // playCollection = new Collection<Play>(this);
}

export const UnitSchema = new EntitySchema<UnitEntity, BaseModuleEntity>({
  class: UnitEntity,
  tableName: "Unit",
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
    annotation: { type: "json" },
    data: { type: "json" },
    index: { type: "integer", nullable: true },
    // memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "unit" },
    // playCollection: { kind: "1:m", entity: () => Play, mappedBy: "unit" },
    // TagToUnitInverse: { kind: "m:n", entity: () => Tag, mappedBy: "TagToUnit" },
  },
});
