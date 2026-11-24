import { types, Collection, EntitySchema } from "@mikro-orm/core";
import { DataEntity, DataSchema, DataRepository } from "../base/DataEntity.ts";
import { IdentityEntity } from "./Identity.ts";
import { TerminalEntity } from "./Terminal.ts";

export class DaemonRepository extends DataRepository {
  unique(query) {
    return { slug: query.slug };
  }
}

export class DaemonEntity extends DataEntity {
  slug!: string;
  remote!: string;
  reported!: string;

  identities = new Collection<IdentityEntity>(this);
  terminals = new Collection<TerminalEntity>(this);
}

export const DaemonSchema = new EntitySchema({
  class: DaemonEntity,
  extends: DataSchema,
  repository: () => DaemonRepository,
  name: "Daemon",
  tableName: "Daemon",
  properties: {
    slug: { type: types.string, unique: true },
    remote: { type: types.string },
    reported: { type: types.string, defaultRaw: `'UNKNOWN'` },
    identities: { kind: "m:n", entity: () => IdentityEntity, mappedBy: (identity) => identity.daemons },
    terminals: { kind: "1:m", entity: () => TerminalEntity, mappedBy: (terminal) => terminal.daemon },
  },
});

export default {
  type: "daemon",
  schema: DaemonSchema,
  entity: DaemonEntity,
  repository: DaemonRepository,
};
