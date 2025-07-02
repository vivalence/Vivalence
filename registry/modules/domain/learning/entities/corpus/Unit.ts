import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataSchema } from "@vivalence/entities";

import { TagEntity } from "../corpus/Tag.ts";
import { ExerciseEntity } from "../userland/Exercise.ts";
import { PlayEntity } from "../userland/Play.ts";
import { MemoryEntity } from "../userland/Memory.ts";

export class UnitEntity extends BaseDataEntity {
  tags = new Collection<TagEntity>(this);
  memories = new Collection<MemoryEntity>(this);
  plays = new Collection<PlayEntity>(this);

  annotation: any & Opt = {};
  data: any & Opt = {};
}

export const UnitSchema = new EntitySchema<UnitEntity, BaseDataEntity>({
  class: UnitEntity,
  tableName: "Unit",
  extends: BaseDataSchema,
  uniques: [{ properties: ["slug"] }],
  properties: {
    memories: {
      kind: "1:m",
      entity: () => MemoryEntity,
      mappedBy: (memory) => memory.unit,
    },
    exercises: {
      kind: "m:n",
      entity: () => ExerciseEntity,
      mappedBy: (exercise) => exercise.units,
    },
    plays: {
      kind: "1:m",
      entity: () => PlayEntity,
      mappedBy: (play) => play.unit,
    },
    tags: { kind: "m:n", entity: () => TagEntity, mappedBy: "units" },

    annotation: { type: "json" },
    data: { type: "json" },
  },
});
