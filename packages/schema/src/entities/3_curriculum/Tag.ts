import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BaseCurriculumEntity, BaseCurriculumSchema } from "../0_root/BaseCurriculumEntity.ts";
import { RuntimeEntity } from "../1_repo/Runtime.ts";
import { OntologyEntity } from "../2_runtime/Ontology.ts";
import { CurriculumEntity } from "../2_runtime/Curriculum.ts";

// import { CurriculumEntity } from "../2_runtime/Curriculum.ts";
// import { Memory } from "../4_userland/Memory.ts";
// import { Play } from "../4_userland/Play.ts";
// import { Runtime } from "../1_repo/Runtime.ts";
// import { Unit } from "../3_curriculum/Unit.ts";

export enum TagTraitsEnum {
  ONTOLOGICAL = "ONTOLOGICAL", // subject matter attribute
  STRUCTURAL = "STRUCTURAL", // organizing of units into sets or categories
  LEARNABLE = "LEARNABLE", // higher order feature that can be mastered
  COMPLETABLE = "COMPLETABLE", // contains a set of units where each can be mastered
}

export class TagEntity extends BaseCurriculumEntity {
  runtime!: Rel<RuntimeEntity>;
  ontology?: Rel<OntologyEntity>;
  curriculum?: Rel<CurriculumEntity>;
  traits: TagTraitsEnum[] & Opt = [];
  data: any & Opt = "{}";

  // constructor(data: Record<string, any> = {}) {
  //   super(data);
  //   Object.assign(this, data);
  // }

  // TagToUnit = new Collection<Unit>(this);
  // memoryCollection = new Collection<Memory>(this);
  // playCollection = new Collection<Play>(this);
}

// function onCreate(args) {console.log("onupsert tag args", args); console.log("onupsert tag this", this);}

export const TagSchema = new EntitySchema<TagEntity, BaseCurriculumEntity>({
  class: TagEntity,
  extends: BaseCurriculumSchema,
  tableName: "Tag",
  // hooks: {beforeUpsert: [onCreate],},
  uniques: [{ properties: ["slug", "runtime"] }],
  properties: {
    runtime: {
      kind: "m:1",
      entity: () => RuntimeEntity,
      fieldName: "runtime",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    ontology: {
      kind: "m:1",
      entity: () => OntologyEntity,
      fieldName: "ontology",
      updateRule: "cascade",
      deleteRule: "set null",
      nullable: true,
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
      columnType: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => TagTraitsEnum,
      default: [],
    },
    data: { type: "json" },
    // TagToUnit: {kind: "m:n", entity: () => Unit, pivotTable: "_TagToUnit", joinColumn: "A", inverseJoinColumn: "B",},
    // memoryCollection: { kind: "1:m", entity: () => Memory, mappedBy: "tag" },
    // playCollection: { kind: "1:m", entity: () => Play, mappedBy: "tag" },
  },
});
