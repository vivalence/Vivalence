import { Cascade, types, EntitySchema, Collection, type Opt, type Rel } from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "./index.ts";
import { IntentEntity } from "./index.ts";
import { BufferEntity } from "./index.ts";
import { TurnEntity } from "./index.ts";
import { LiteralEntity } from "./index.ts";
import { SymbolEntity } from "./index.ts";
import { DaemonEntity } from "./index.ts";
import { NoteEntity } from "./index.ts";

export enum ModeTraitsEnum {
  BOOTED = "BOOTED",
  RUNTIME = "RUNTIME",

  APPLICATION = "APPLICATION",

  TOPOGRAPHICAL = "TOPOGRAPHICAL", // use to target read data from storage in mode
  TOPOLOGICAL = "TOPOLOGICAL", // use to target read data from storage in mode

  DATASET = "DATASET", // use to control data storage in mode
  DATASINK = "DATASINK",

  HARNESSED = "HARNESSED",
  CONVERSATIONAL = "CONVERSATIONAL",
  AGENTIC = "AGENTIC",
  TOOLING = "TOOLING",

  EMITTER = "EMITTER",
  GENERATIVE = "GENERATIVE",

  EXPOSED = "EXPOSED",

  INTENTED = "INTENTED",
  FRAUGHT = "FRAUGHT",
  MOUNTED = "MOUNTED",

  // ENTRYPOINT REFERENCABLE

  CHAOSMONKEY = "CHAOSMONKEY", // deprecated
  BUFFERED = "BUFFERED", // deprecated
  SELFEVIDENT = "SELFEVIDENT", // depracated
  TOOLED = "TOOLED", // TODO deprecated → TOOLING; rows written before the rename still hydrate — drop with the migration that rewrites them
  STANDALONE = "STANDALONE", // deprecated
}

export class ModeRepository extends DataRepository {
  unique(opt) {
    return { daemon: opt.daemon, type: opt.type, slug: opt.slug };
  }
}
export class ModeEntity extends DataEntity {
  daemon: Rel<DaemonEntity> | null & Opt = null;
  type: string;
  slug: string & Opt = "";
  traits: ModeTraitsEnum[] & Opt = [];
  name?: string;
  description?: string;
  version?: string;
  installed: string & Opt = "";

  intents = new Collection<IntentEntity>(this);
  buffers = new Collection<BufferEntity>(this);
  turns = new Collection<TurnEntity>(this);

  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);
  notes = new Collection<NoteEntity>(this);
}

export const ModeSchema = new EntitySchema({
  class: ModeEntity,
  repository: () => ModeRepository,
  extends: DataSchema,
  name: "Mode",
  tableName: "Mode",
  uniques: [{ properties: ["daemon", "slug", "type"] }],
  filters: { daemon: { cond: (args: any) => ({ daemon: args.daemon }), default: false } },
  properties: {
    type: { type: types.string },
    slug: { type: types.string },
    daemon: { kind: "m:1", entity: () => DaemonEntity, inversedBy: (daemon) => daemon.modes, nullable: true, updateRule: "cascade", deleteRule: "cascade" },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
    installed: { type: types.string, default: "" },
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

    literals: {
      kind: "1:m",
      entity: () => LiteralEntity,
      mappedBy: (literal) => literal.mode,
      hidden: true,
    },

    symbols: {
      kind: "1:m",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.mode,
      hidden: true,
    },
    notes: { kind: "1:m", entity: () => NoteEntity, mappedBy: (note) => note.mode, hidden: true },
  },
});

export default {
  type: "mode",
  schema: ModeSchema,
  entity: ModeEntity,
  repository: ModeRepository,
};
