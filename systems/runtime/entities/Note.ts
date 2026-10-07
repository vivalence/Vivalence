import { Collection, EntitySchema, types, type Opt, type Rel } from "@mikro-orm/core";
import { DataEntity, DataRepository, DataSchema } from "./index.ts";
import { DaemonEntity, ModeEntity, UserEntity, LiteralEntity, SymbolEntity } from "./index.ts";

export class NoteRepository extends DataRepository {
  unique(query) {
    return { daemon: query.daemon ?? null, mode: query.mode ?? null, user: query.user ?? null, slug: query.slug };
  }
  index(where = {}, { limit = 12 } = {}) {
    return this.find(where, { limit, orderBy: { updatedAt: "DESC" } });
  }
}

export class NoteEntity extends DataEntity {
  slug!: string;
  user?: Rel<UserEntity>;
  daemon?: Rel<DaemonEntity>;
  mode?: Rel<ModeEntity>;
  literal?: Rel<LiteralEntity>;

  symbols = new Collection<SymbolEntity>(this);

  parent?: Rel<NoteEntity>;
  children = new Collection<NoteEntity>(this);

  traits: string[] & Opt = [];
  trait: any & Opt = {};
}

export const NoteSchema = new EntitySchema<NoteEntity, DataEntity>({
  class: NoteEntity,
  extends: DataSchema,
  tableName: "Note",
  name: "Note",
  repository: () => NoteRepository,
  uniques: [
    {
      name: "Note_scope_slug_unique",
      expression: "create unique index `Note_scope_slug_unique` on `Note` (coalesce(`daemon_slug`, ''), coalesce(`mode_id`, ''), coalesce(`user_id`, ''), `slug`)",
    },
  ],
  filters: {
    user: { cond: (args: any) => ({ $or: [{ user: args.user }, { user: null }] }), default: true },
    daemon: { cond: (args: any) => ({ daemon: args.daemon }), default: false },
  },
  properties: {
    slug: { type: types.string },
    daemon: { kind: "m:1", entity: () => DaemonEntity, inversedBy: (daemon) => daemon.notes, nullable: true, updateRule: "cascade", deleteRule: "cascade" },
    mode: { kind: "m:1", entity: () => ModeEntity, inversedBy: (mode) => mode.notes, nullable: true, deleteRule: "cascade" },
    user: { kind: "m:1", entity: () => UserEntity, inversedBy: (user) => user.notes, nullable: true, deleteRule: "cascade" },
    literal: { kind: "m:1", entity: () => LiteralEntity, inversedBy: (literal) => literal.notes, nullable: true, deleteRule: "cascade" },
    parent: { kind: "m:1", entity: () => NoteEntity, nullable: true, deleteRule: "cascade" },
    children: { kind: "1:m", entity: () => NoteEntity, mappedBy: (note) => note.parent },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },
    symbols: { kind: "m:n", entity: () => SymbolEntity, owner: true, pivotTable: "note_symbols", joinColumns: ["note_entity_id"], inverseJoinColumns: ["symbol_entity_id"] },
  },
});

export default { type: "note", schema: NoteSchema, entity: NoteEntity, repository: NoteRepository };
