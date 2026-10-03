import { types, Collection, EntitySchema, type Opt } from "@mikro-orm/core";
import { DataEntity, DataSchema } from "../base/DataEntity.ts";
import { DaemonEntity } from "./Daemon.ts";
import { TerminalEntity } from "./Terminal.ts";

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

export enum IdentityTraitsEnum {
  ADMIN = "ADMIN",
  THEMED = "THEMED",
  DOCKED = "DOCKED",
  HOMED = "HOMED",
}

export class IdentityEntity extends DataEntity {
  slug!: string;
  authentication: AuthenticatorEmbedEntity & Opt = {};
  traits: IdentityTraitsEnum[] & Opt = [];
  trait: any & Opt = {};

  daemons = new Collection<DaemonEntity>(this);
  terminals = new Collection<TerminalEntity>(this);
}

export const IdentitySchema = new EntitySchema({
  class: IdentityEntity,
  extends: DataSchema,
  tableName: "Identity",
  name: "Identity",
  properties: {
    slug: { type: types.string, unique: true },
    authentication: {
      kind: "embedded",
      entity: "AuthenticatorEmbedEntity",
      object: true,
      defaultRaw: `'{}'`,
      hidden: true,
    },
    traits: {
      items: () => IdentityTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      columnType: "json",
    },
    trait: { type: types.json, defaultRaw: `'{}'` },
    daemons: { kind: "m:n", entity: () => DaemonEntity, owner: true, pivotTable: "Identity_daemons" },
    terminals: { kind: "1:m", entity: () => TerminalEntity, mappedBy: (terminal) => terminal.identity },
  },
});

export default {
  type: "identity",
  schema: IdentitySchema,
  entity: IdentityEntity,
};
