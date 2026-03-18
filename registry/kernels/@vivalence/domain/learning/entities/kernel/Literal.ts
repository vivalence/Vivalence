import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { EventSubscriber, type EventArgs } from "@mikro-orm/core";
import { maps } from "@vivalence/typology/entities";

// import { PlayEntity } from "../userspace/Play.ts";
import { MemoryEntity } from "../userspace/Memory.ts";

export enum LiteralTraitsEnum {
  TRANSLATED = "TRANSLATED",
  EXEMPLIFIED = "EXEMPLIFIED",
  RANKED = "RANKED",
  ANNOTATED = "ANNOTATED",
  VOCALIZED = "VOCALIZED",
}

export class LiteralEntity extends maps.kernel.literal.entity {
  traits: LiteralTraitsEnum[] & Opt = [];
  rank: number | (null & Opt) = null;
  memories = new Collection<MemoryEntity>(this);
  // plays = new Collection<PlayEntity>(this);

  get memory(): MemoryEntity | undefined {
    return this.memories.isInitialized() ? this.memories.getItems()[0] : undefined;
  }

  get translated() {
    return this.data.TRANSLATED;
  }

  get example() {
    return this.data.EXEMPLIFIED;
  }

  // toJSON(...args: any[]) {const json = super.toJSON(...args); json.memory = this.memory?.toJSON?.() ?? this.memory ?? null; return json;}
}

export const LiteralSchema = new EntitySchema({
  class: LiteralEntity,
  extends: maps.kernel.literal.schema,
  tableName: "Literal",
  name: "Literal",
  properties: {
    traits: {
      items: () => LiteralTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },

    rank: {
      type: types.integer,
      nullable: true,
      defaultRaw: "null",
    },

    memories: {
      kind: "1:m",
      entity: () => MemoryEntity,
      mappedBy: (memory) => memory.literal,
    },

    // plays: {kind: "1:m", entity: () => PlayEntity, mappedBy: (play) => play.literal,},
  },
});

export class LiteralSubscriber implements EventSubscriber<LiteralEntity> {
  getSubscribedEntities() {
    return [LiteralEntity];
  }
  beforeCreate({ entity }: EventArgs<LiteralEntity>) {
    entity.rank = entity.data?.RANKED?.rank ?? 999999; // ugh
  }
  beforeUpdate({ entity }: EventArgs<LiteralEntity>) {
    entity.rank = entity.data?.RANKED?.rank ?? 999999; // ugh
  }
}

export default {
  type: "literal",
  traits: LiteralTraitsEnum,
  schema: LiteralSchema,
  entity: LiteralEntity,
  subscriber: LiteralSubscriber,
  // gestalt: gestalt,
  // repository: TopographyRepository,
};
