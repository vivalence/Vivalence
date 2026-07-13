import { Cascade, types, EntitySchema, Collection, type Opt, type Rel } from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { IntentEntity } from "../index.ts";
import { BufferEntity } from "../index.ts";
import { TurnEntity } from "../index.ts";

export enum ModeTraitsEnum {
  TOPOGRAPHICAL = "TOPOGRAPHICAL", // use to target read data from storage in mode
  TOPOLOGICAL = "TOPOLOGICAL", // use to target read data from storage in mode
  DATASET = "DATASET", // use to control data storage in mode

  FRAUGHT = "FRAUGHT",
  APPLICATION = "APPLICATION",
  EXPOSED = "EXPOSED",
  HARNESSED = "HARNESSED",
  INTENTED = "INTENTED",
  EMITTER = "EMITTER",
  CONVERSATIONAL = "CONVERSATIONAL",
  TOOLED = "TOOLED",
  STANDALONE = "STANDALONE",

  // ENTRYPOINT REFERENCABLE

  CHAOSMONKEY = "CHAOSMONKEY", // deprecated
  BUFFERED = "BUFFERED", // deprecated
  SELFEVIDENT = "SELFEVIDENT", // depracated
}

export class ModeRepository extends DataRepository {
  unique(opt) {
    // ?? uniqueKeys = ["slug", "type"];
    return { type: opt.type, slug: opt.slug };
  }
}
export class ModeEntity extends DataEntity {
  type: string;
  slug: string & Opt = "";
  traits: ModeTraitsEnum[] & Opt = [];
  name?: string;
  description?: string;
  version?: string;
  installed: Boolean = false;

  intents = new Collection<IntentEntity>(this);
  buffers = new Collection<BufferEntity>(this);
  turns = new Collection<TurnEntity>(this);
}

export const ModeSchema = new EntitySchema({
  class: ModeEntity,
  repository: () => ModeRepository,
  extends: DataSchema,
  name: "Mode",
  tableName: "Mode",
  uniques: [{ properties: ["slug", "type"] }],
  properties: {
    type: { type: types.string },
    slug: { type: types.string },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
    installed: { type: types.boolean },
    version: { type: types.string, nullable: true },

    traits: {
      items: () => ModeTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
    },

    intents: {
      kind: "1:m",
      entity: () => IntentEntity,
      mappedBy: (intent) => intent.mode,
      cascade: [Cascade.REMOVE],
      orphanRemoval: true,
    },

    buffers: {
      kind: "1:m",
      entity: () => BufferEntity,
      mappedBy: (buffer) => buffer.mode,
      cascade: [Cascade.REMOVE],
      orphanRemoval: true,
    },

    turns: {
      kind: "1:m",
      entity: () => TurnEntity,
      mappedBy: (turn) => turn.mode,
    },
  },
});

export default {
  type: "mode",
  schema: ModeSchema,
  entity: ModeEntity,
  repository: ModeRepository,
};
