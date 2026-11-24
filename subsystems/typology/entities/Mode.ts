import { Cascade, types, EntitySchema, Collection, type Opt, type Rel } from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "./index.ts";
import { IntentEntity } from "./index.ts";
import { BufferEntity } from "./index.ts";
import { TurnEntity } from "./index.ts";
import { LiteralEntity } from "./index.ts";
import { SymbolEntity } from "./index.ts";
import { DaemonEntity } from "./index.ts";
import { NoteEntity } from "./index.ts";
import { SurfaceEntity } from "./index.ts";
import { FileEntity } from "./index.ts";
import { Vector } from "../prototypes/vector.js";


export class ModeRepository extends DataRepository {
  unique(opt) {
    return { daemon: opt.daemon, type: opt.type, slug: opt.slug };
  }
}
export class ModeEntity extends DataEntity {
  daemon: Rel<DaemonEntity> | (null & Opt) = null;
  type: string;
  slug: string & Opt = "";
  traits: string[] & Opt = [];
  name?: string;
  description?: string;
  version?: string;
  installed: string & Opt = "";

  intents = new Collection<IntentEntity>(this);
  buffers = new Collection<BufferEntity>(this);
  turns = new Collection<TurnEntity>(this);
  surfaces = new Collection<SurfaceEntity>(this);
  files = new Collection<FileEntity>(this);

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
  filters: { daemon: { cond: (args: any) => (args?.daemon ? { daemon: args.daemon } : {}), default: true, args: false } },
  properties: {
    type: { type: types.string },
    slug: { type: types.string },
    daemon: {
      kind: "m:1",
      entity: () => DaemonEntity,
      inversedBy: (daemon) => daemon.modes,
      nullable: true,
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    name: { type: types.string, nullable: true },
    description: { type: types.string, nullable: true },
    installed: { type: types.string, default: "" },
    version: { type: types.string, nullable: true },

    traits: { type: types.json, defaultRaw: `'[]'` },

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

    turns: {
      kind: "1:m",
      entity: () => TurnEntity,
      mappedBy: (turn) => turn.mode,
    },

    surfaces: {
      kind: "1:m",
      entity: () => SurfaceEntity,
      mappedBy: (surface) => surface.mode,
      cascade: [Cascade.REMOVE],
      orphanRemoval: true,
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
    files: {
      kind: "1:m",
      entity: () => FileEntity,
      mappedBy: (file) => file.mode,
      cascade: [Cascade.REMOVE],
      orphanRemoval: true,
      hidden: true,
    },
  },
});

const twitch = new Vector().open("/after/datamap/migrate/2026.11.0", (ctx) =>
  ctx.migrate.mapping("Mode", (mode) => ({
    traits: mode.traits.map(
      (word) => ({ VIEWABLE: "SURFACED", GENERATIVE: "SURFACING" })[word] ?? word,
    ),
  })),
);

export default {
  type: "mode",
  schema: ModeSchema,
  entity: ModeEntity,
  repository: ModeRepository,
  twitch,
};
