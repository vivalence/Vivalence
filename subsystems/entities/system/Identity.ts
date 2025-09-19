import {
  types,
  Collection,
  EntitySchema,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../base/BaseEntity.ts";
import { RuntimeEntity } from "./Runtime.ts";

export class AuthenticatorEmbedEntity {
  provider!: string;
  credentials: Record<string, any> & Opt = {};
  tokens: Record<string, string> & Opt = {};
}

export const AuthenticatorEmbedSchema = new EntitySchema({
  class: AuthenticatorEmbedEntity,
  embeddable: true,
  properties: {
    provider: { type: types.string, default: "" },
    credentials: { type: types.json, defaultRaw: `"{}"` },
    tokens: { type: types.json, defaultRaw: `"{}"` },
  },
});

export class IdentityEntity extends BaseEntity {
  slug!: string;
  runtimes = new Collection<RuntimeEntity>(this);
  authentication: AuthenticatorEmbedEntity & Opt = {};
}

export const IdentitySchema = new EntitySchema({
  class: IdentityEntity,
  extends: BaseSchema,
  tableName: "Identity",
  properties: {
    slug: { type: types.string, unique: true },
    runtimes: {
      kind: "1:m",
      entity: () => RuntimeEntity,
      mappedBy: (runtime) => runtime.identity,
    },
    authentication: {
      kind: "embedded",
      entity: "AuthenticatorEmbedEntity",
      object: true,
      default: {},
      defaultRaw: `"{}"`,
    },
  },
});

export default { IdentitySchema, IdentityEntity };
