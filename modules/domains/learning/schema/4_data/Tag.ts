import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseDataEntity, BaseDataSchema } from "@vivalence/schema";
// import { RuntimeEntity } from "@vivalence/schema";

// import { OntologyEntity } from "../2_module/Ontology.ts";
// import { CorpusEntity } from "../2_module/Corpus.ts";

import { UnitEntity } from "../4_data/Unit.ts";
import { PlayEntity } from "../5_userland/Play.ts";
import { MemoryEntity } from "../5_userland/Memory.ts";

export enum TagTraitsEnum {
  ONTOLOGICAL = "ONTOLOGICAL", // subject matter attribute
  STRUCTURAL = "STRUCTURAL", // organizing of units into sets or categories
  LEARNABLE = "LEARNABLE", // higher order feature that can be mastered
  COMPLETABLE = "COMPLETABLE", // contains a set of units where each can be mastered
  AGENTIC = "AGENTIC", // used in context of agents and may evolve over time.
}

export class TagEntity extends BaseDataEntity {
  // runtime!: Rel<RuntimeEntity>;
  // ontology?: Rel<OntologyEntity>;
  // corpus?: Rel<CorpusEntity>;

  ancestor?: Rel<TagEntity>;
  decendants = new Collection<TagEntity>(this);
  units = new Collection<UnitEntity>(this);

  plays = new Collection<PlayEntity>(this);
  memories = new Collection<MemoryEntity>(this);

  traits: TagTraitsEnum[] & Opt = [];
  data: any & Opt = {};
}

// function onCreate(args) {console.log("onupsert tag args", args); console.log("onupsert tag this", this);} // hooks: {beforeUpsert: [onCreate],},

export const TagSchema = new EntitySchema<TagEntity, BaseDataEntity>({
  class: TagEntity,
  extends: BaseDataSchema,
  tableName: "Tag",
  uniques: [{ properties: ["slug"] }],
  properties: {
    // runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",},
    // ontology: {kind: "m:1", entity: () => OntologyEntity, fieldName: "ontology", updateRule: "cascade", deleteRule: "set null", nullable: true,},
    // corpus: {kind: "m:1", entity: () => CorpusEntity, fieldName: "curriculum", updateRule: "cascade", deleteRule: "set null", nullable: true,},
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
    memories: { kind: "1:m", entity: () => MemoryEntity, mappedBy: (memory) => memory.tag },
    plays: { kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.tag },
    traits: {
      columnType: "json",
      defaultRaw: `"[]"`,
      enum: true,
      array: true,
      items: () => TagTraitsEnum,
      default: [],
    },
    data: {
      type: "json",
      // nullable: true,
      // defaultRaw: `"{}"`,
      // default: {},
    },
  },
});
