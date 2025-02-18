import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseModuleEntity, BaseModuleSchema } from "../0_root/BaseModuleEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";
import { PlayEntity } from "../4_userland/Play.ts";
import { MemoryEntity } from "../4_userland/Memory.ts";
import { TagEntity } from "../3_curriculum/Tag.ts";

// traits: [Agentic]
export class UnitEntity extends BaseModuleEntity {
  runtime!: Rel<RuntimeEntity>;
  curriculum?: Rel<CurriculumEntity>;
  tags = new Collection<TagEntity>(this);
  memories = new Collection<MemoryEntity>(this);
  plays = new Collection<PlayEntity>(this);

  annotation: any & Opt = "{}";
  data: any & Opt = "{}";
  index?: number;
}

export const UnitSchema = new EntitySchema<UnitEntity, BaseModuleEntity>({
  class: UnitEntity,
  tableName: "Unit",
  extends: BaseModuleSchema,
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
    memories: { kind: "1:m", entity: () => MemoryEntity, mappedBy: (memory) => memory.unit },
    plays: { kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.unit },
    index: { type: Number, nullable: true },
    tags: { kind: "m:n", entity: () => TagEntity, mappedBy: "units" },

    // embeddables/
    annotation: { type: "json" },
    data: { type: "json" },
  },
});
