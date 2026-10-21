import { types, Collection, EntitySchema, EntityRepositoryType, type Opt, type Rel } from "@mikro-orm/core";
import { mime, Vector } from "@vivalence/typology";

import { DataRepository, DataEntity, DataSchema } from "./index.ts";
import { ModeEntity } from "./index.ts";
import { ThreadEntity } from "./index.ts";
import { LiteralEntity } from "./index.ts";
import { SymbolEntity } from "./index.ts";
import { TurnEntity, NoteEntity, FileEntity, ViewEntity } from "./index.ts";

export enum BufferStatusEnum {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  DONE = "DONE",
  ERROR = "ERROR",
  STALE = "STALE",
}

export class BufferRepository extends DataRepository {
  // every query first, the mint last: a query auto-flushes a pending row, and a row flushed
  // before its index is taken is named for the wrong one.
  async create({ thread, literals, symbols, ...fields }: any) {
    thread ??= fields.turns?.[0] ? (await this.em.findOneOrFail(TurnEntity, fields.turns[0])).thread : null;
    const bound = thread ? await this.em.findOneOrFail(ThreadEntity, thread) : null;
    const buffer = super.create({
      ...fields,
      ...(literals && { literals: await this.em.getRepository(LiteralEntity).findByIdentifiers(literals) }),
      ...(symbols && { symbols: await this.em.getRepository(SymbolEntity).findByIdentifiers(symbols) }),
    });
    bound?.bindBuffer(buffer);
    return buffer;
  }
}

export class BufferEntity extends DataEntity {
  status: BufferStatusEnum & Opt = BufferStatusEnum.PENDING;
  data: any & Opt = {};
  mime: string & Opt = mime.json;
  files = new Collection<FileEntity>(this);
  views = new Collection<ViewEntity>(this);
  turns = new Collection<TurnEntity>(this);
  notes = new Collection<NoteEntity>(this);
  index: number & Opt = 0;
  traits: string[] & Opt = [];
  trait: any & Opt = {};

  mode?: Rel<ModeEntity>;
  thread!: Rel<ThreadEntity>;

  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);
  [EntityRepositoryType]?: BufferRepository;
}

export const BufferSchema = new EntitySchema<BufferEntity, DataEntity>({
  class: BufferEntity,
  extends: DataSchema,
  name: "Buffer",
  tableName: "Buffer",
  repository: () => BufferRepository,
  filters: {
    user: {
      cond: (args: any) => ({ thread: { user: args.user } }),
      default: true,
    },
  },
  properties: {
    status: {
      enum: true,
      items: () => BufferStatusEnum,
      defaultRaw: `'${BufferStatusEnum.PENDING}'`,
    },
    data: { type: types.json, defaultRaw: `'{}'` },
    mime: { type: types.string, default: mime.json, nullable: true },
    files: { kind: "m:n", entity: () => FileEntity, owner: true, pivotTable: "buffer_files", joinColumns: ["buffer_id"], inverseJoinColumns: ["file_id"] },
    views: { kind: "m:n", entity: () => ViewEntity, owner: true, pivotTable: "buffer_views", joinColumns: ["buffer_id"], inverseJoinColumns: ["view_id"] },
    turns: { kind: "m:n", entity: () => TurnEntity, owner: true, pivotTable: "buffer_turns", joinColumns: ["buffer_id"], inverseJoinColumns: ["turn_id"] },
    notes: { kind: "1:m", entity: () => NoteEntity, mappedBy: (note) => note.buffer },
    index: { type: types.integer, default: 0 },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      nullable: true,
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    thread: {
      kind: "m:1",
      entity: () => ThreadEntity,
      fieldName: "thread",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      owner: true,
      pivotTable: "buffer_literals",
      joinColumns: ["buffer_entity_id"],
      inverseJoinColumns: ["literal_entity_id"],
    },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      owner: true,
      pivotTable: "buffer_symbols",
      joinColumns: ["buffer_entity_id"],
      inverseJoinColumns: ["symbol_entity_id"],
    },
  },
});

const twitch = new Vector().open("/before/buffer/create", async (ctx) => {
  if (ctx.input.entity.traits.includes("LABELED")) return;
  const mode = ctx.input.entity.mode ? await ctx.input.em.findOne(ModeEntity, ctx.input.entity.mode) : null;
  ctx.input.entity.traits = [...ctx.input.entity.traits, "LABELED"];
  ctx.input.entity.trait = { ...ctx.input.entity.trait, LABELED: { name: `${mode?.slug ?? "home"} #${ctx.input.entity.index}` } };
});

export default {
  type: "buffer",
  schema: BufferSchema,
  entity: BufferEntity,
  repository: BufferRepository,
  twitch,
};
