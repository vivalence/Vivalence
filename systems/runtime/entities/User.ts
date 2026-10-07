import { Collection, EntitySchema, types, type Opt } from "@mikro-orm/core";
import { DataEntity, DataRepository, DataSchema } from "@vivalence/typology/entities";
import { DaemonEntity, TerminalEntity, ThreadEntity, IntentEntity, NoteEntity } from "./index.ts";

export class AuthenticatorEmbedEntity {
  provider!: string;
  credentials: Record<string, any> & Opt = {};
  tokens: Record<string, string> & Opt = {};
}

export const AuthenticatorEmbedSchema = new EntitySchema({
  class: AuthenticatorEmbedEntity,
  embeddable: true,
  properties: {
    provider: { type: types.string, defaultRaw: `''` },
    credentials: { type: types.json, defaultRaw: `'{}'` },
    tokens: { type: types.json, defaultRaw: `'{}'` },
  },
});

export class UserRepository extends DataRepository {
  unique(query) {
    return { slug: query.slug };
  }
  byUsername(username: string) {
    return this.em.createQueryBuilder(this.entityName, "u")
      .where(`json_extract(u.authentication, '$.credentials.username') = ?`, [username])
      .getSingleResult();
  }
}

export class UserEntity extends DataEntity {
  slug!: string;
  authentication: AuthenticatorEmbedEntity & Opt = {};
  traits: string[] & Opt = [];
  trait: any & Opt = {};

  daemons = new Collection<DaemonEntity>(this);
  terminals = new Collection<TerminalEntity>(this);
  threads = new Collection<ThreadEntity>(this);
  intents = new Collection<IntentEntity>(this);
  notes = new Collection<NoteEntity>(this);
}

export const UserSchema = new EntitySchema<UserEntity, DataEntity>({
  class: UserEntity,
  extends: DataSchema,
  repository: () => UserRepository,
  tableName: "User",
  name: "User",
  filters: {
    user: {
      cond: (args: any) => (args?.user ? { id: args.user } : {}),
      default: true,
      args: false,
    },
  },
  properties: {
    slug: { type: types.string, unique: true },
    authentication: { kind: "embedded", entity: () => AuthenticatorEmbedEntity, object: true, defaultRaw: `'{}'`, hidden: true },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json, defaultRaw: `'{}'` },
    daemons: { kind: "m:n", entity: () => DaemonEntity, owner: true, pivotTable: "User_daemons" },
    terminals: { kind: "1:m", entity: () => TerminalEntity, mappedBy: (terminal) => terminal.user },
    threads: { kind: "1:m", entity: () => ThreadEntity, mappedBy: (thread) => thread.user },
    intents: { kind: "1:m", entity: () => IntentEntity, mappedBy: (intent) => intent.user },
    notes: { kind: "1:m", entity: () => NoteEntity, mappedBy: (note) => note.user },
  },
});

export const authenticator = { type: "authenticator", schema: AuthenticatorEmbedSchema, entity: AuthenticatorEmbedEntity };
export default { type: "user", schema: UserSchema, entity: UserEntity, repository: UserRepository };
