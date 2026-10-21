import { BaseEntity, Collection, EntitySchema, types, type Opt } from "@mikro-orm/core";
import { DataRepository } from "@vivalence/typology/entities";
import {
  ModeEntity,
  LiteralEntity,
  SymbolEntity,
  NoteEntity,
  UserEntity,
} from "./index.ts";

export class DaemonRepository extends DataRepository {
  unique(query) {
    return { slug: query.slug };
  }
}

export class DaemonEntity extends BaseEntity {
  slug!: string;
  get id(): string {
    return this.slug;
  }
  mask: any & Opt = {};
  traits: string[] & Opt = [];
  trait: any & Opt = {};
  createdAt: Date & Opt = new Date();
  updatedAt: Date & Opt = new Date();

  modes = new Collection<ModeEntity>(this);
  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);
  notes = new Collection<NoteEntity>(this);
  users = new Collection<UserEntity>(this);
}

export const DaemonSchema = new EntitySchema({
  class: DaemonEntity,
  repository: () => DaemonRepository,
  tableName: "Daemon",
  name: "Daemon",
  properties: {
    slug: { type: types.string, primary: true },
    id: { type: types.string, persist: false, getter: true },
    mask: { type: types.json, defaultRaw: `'{}'` },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },
    createdAt: {
      type: types.datetime,
      onCreate: () => new Date(),
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    updatedAt: {
      type: types.datetime,
      onCreate: () => new Date(),
      onUpdate: () => new Date(),
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    modes: { kind: "1:m", entity: () => ModeEntity, mappedBy: (mode) => mode.daemon, hidden: true },
    literals: {
      kind: "1:m",
      entity: () => LiteralEntity,
      mappedBy: (literal) => literal.daemon,
      hidden: true,
    },
    symbols: {
      kind: "1:m",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.daemon,
      hidden: true,
    },
    notes: { kind: "1:m", entity: () => NoteEntity, mappedBy: (note) => note.daemon, hidden: true },
    users: {
      kind: "m:n",
      entity: () => UserEntity,
      mappedBy: (user) => user.daemons,
      hidden: true,
    },
  },
});

export default {
  type: "daemon",
  schema: DaemonSchema,
  entity: DaemonEntity,
  repository: DaemonRepository,
};
