import { Cascade, types, EntitySchema, Collection, type Opt, type Rel } from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { IntentEntity } from "../index.ts";
import { BufferEntity } from "../index.ts";

export enum ModeTraitsEnum {
  VIEWABLE = "VIEWABLE",
  DATASET = "DATASET",
  CHAOSMONKEY = "CHAOSMONKEY",
  TOPOGRAPHICAL = "TOPOGRAPHICAL",
  INTENTED = "INTENTED",
  SELFEVIDENT = "SELFEVIDENT",
  EMITTER = "EMITTER",
  FRAUGHT = "FRAUGHT",
  VALENTIC = "VALENTIC", // legacy
  BUFFERED = "BUFFERED", // legacy
  PRODUCER = "PRODUCER", // legacy
}

export class ModeRepository extends DataRepository {
  unique(opt) {
    // ?? uniqueKeys = ["slug", "type"];
    return { type: opt.type, slug: opt.slug };
  }
}
export class ModeEntity extends DataEntity {
  slug: string & Opt = "";
  name?: string;
  description?: string;
  traits: ModeTraitsEnum[] & Opt = [];
  type?: string;
  installed: Boolean = false;
  version?: string;

  intents = new Collection<IntentEntity>(this);
  buffers = new Collection<BufferEntity>(this);
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
    },
  },
});

export default {
  type: "mode",
  schema: ModeSchema,
  entity: ModeEntity,
  repository: ModeRepository,
};
