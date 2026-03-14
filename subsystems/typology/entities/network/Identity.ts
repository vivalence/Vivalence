import {
  types,
  Collection,
  EntitySchema,
  type Opt,
  type Rel,
} from "@mikro-orm/core";
import { BaseEntity, BaseSchema } from "../index.ts";

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

export class IdentityEntity extends BaseEntity {
  slug!: string;
  authentication: AuthenticatorEmbedEntity & Opt = {};
}

export const IdentitySchema = new EntitySchema({
  class: IdentityEntity,
  extends: BaseSchema,
  tableName: "Identity",
  name: "Identity",
  properties: {
    slug: { type: types.string, unique: true },
    authentication: {
      kind: "embedded",
      entity: "AuthenticatorEmbedEntity",
      object: true,
      defaultRaw: `'{}'`,
    },
  },
});

// export default { IdentitySchema, IdentityEntity };

export default {
  type: "identity",
  schema: IdentitySchema,
  entity: IdentityEntity,
  // repository: IdentityRepository,
};
