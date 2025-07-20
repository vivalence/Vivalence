import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseDataEntity, BaseDataSchema } from "@vivalence/entities";

import { UnitEntity } from "../corpus/Unit.ts";
import { ExerciseEntity } from "../userland/Exercise.ts";
import { PlayEntity } from "../userland/Play.ts";
import { MemoryEntity } from "../userland/Memory.ts";

export enum TagTraitsEnum {
  ONTOLOGICAL = "ONTOLOGICAL", // subject matter attribute
  STRUCTURAL = "STRUCTURAL", // organizing of units into sets or categories
  LEARNABLE = "LEARNABLE", // higher order feature that can be mastered
  COMPLETABLE = "COMPLETABLE", // contains a set of units where each can be mastered
  AGENTIC = "AGENTIC", // used in context of agents and may evolve over time.
}

export class TagEntity extends BaseDataEntity {
  traits: TagTraitsEnum[] & Opt = [];
  data: any & Opt = {};

  ancestor?: Rel<TagEntity>;
  decendants = new Collection<TagEntity>(this);
  units = new Collection<UnitEntity>(this);

  plays = new Collection<PlayEntity>(this);
  memories = new Collection<MemoryEntity>(this);
}

export const TagSchema = new EntitySchema<TagEntity, BaseDataEntity>({
  class: TagEntity,
  extends: BaseDataSchema,
  tableName: "Tag",
  uniques: [{ properties: ["slug"] }],
  properties: {
    traits: {
      columnType: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => TagTraitsEnum,
      default: [],
    },
    data: { type: "json" },

    units: {
      kind: "m:n",
      entity: () => UnitEntity,
      inversedBy: "tags",
      pivotTable: "_TagToUnit",
    },
    ancestor: {
      kind: "m:1",
      entity: () => TagEntity,
      fieldName: "ancestor",
      inversedBy: "decendants",
      nullable: true,
    },
    decendants: {
      kind: "1:m",
      entity: () => TagEntity,
      mappedBy: (tag) => tag.ancestor,
    },
    exercises: {
      kind: "m:n",
      entity: () => ExerciseEntity,
      mappedBy: (exercise) => exercise.tags,
    },
    plays: {
      kind: "1:m",
      entity: () => PlayEntity,
      mappedBy: (play) => play.tag,
    },
    memories: {
      kind: "1:m",
      entity: () => MemoryEntity,
      mappedBy: (memory) => memory.tag,
    },
  },
});
