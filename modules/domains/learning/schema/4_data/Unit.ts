import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseDataEntity, BaseDataSchema } from "@vivalence/schema";
// import { RuntimeEntity } from "@vivalence/schema";

// import { CorpusEntity } from "../2_module/Corpus.ts";
import { TagEntity } from "../4_data/Tag.ts";
import { PlayEntity } from "../5_userland/Play.ts";
import { MemoryEntity } from "../5_userland/Memory.ts";

// traits: [Agentic]
export class UnitEntity extends BaseDataEntity {
  // runtime!: Rel<RuntimeEntity>;
  // corpus?: Rel<CorpusEntity>;

  tags = new Collection<TagEntity>(this);
  memories = new Collection<MemoryEntity>(this);
  plays = new Collection<PlayEntity>(this);

  annotation: any & Opt = "{}";
  data: any & Opt = "{}";
  index?: number;
}

export const UnitSchema = new EntitySchema<UnitEntity, BaseDataEntity>({
  class: UnitEntity,
  tableName: "Unit",
  extends: BaseDataSchema,
  uniques: [{ properties: ["slug"] }],
  properties: {
    // runtime: {kind: "m:1", entity: () => RuntimeEntity, fieldName: "runtime", updateRule: "cascade", deleteRule: "cascade",},
    // corpus: {kind: "m:1", entity: () => CorpusEntity, fieldName: "corpus", updateRule: "cascade", deleteRule: "set null", nullable: true,},
    memories: { kind: "1:m", entity: () => MemoryEntity, mappedBy: (memory) => memory.unit },
    plays: { kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.unit },
    tags: { kind: "m:n", entity: () => TagEntity, mappedBy: "units" },

    // embeddables/
    annotation: { type: "json" },
    data: { type: "json" },
    index: { type: Number, nullable: true },
  },
});
