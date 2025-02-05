import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { OauthApplications } from "./OauthApplications.ts";

export class OauthAccessTokens extends BaseModuleEntity {
  id!: bigint;
  application?: Rel<OauthApplications>;
  resourceOwnerId?: number;
  token!: string;
  refreshToken?: string;
  expiresIn?: number;
  revokedAt?: Date;
  scopes?: string;
  previousRefreshToken: string & Opt = "";
  insertedAt!: Date;
  updatedAt!: Date;
  description?: string;
}

export const OauthAccessTokensSchema = new EntitySchema({
  class: OauthAccessTokens,
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "bigint" },
    application: { kind: "m:1", entity: () => OauthApplications, nullable: true },
    resourceOwnerId: {
      type: "integer",
      nullable: true,
      index: "oauth_access_tokens_resource_owner_id_index",
    },
    token: { type: "string", unique: "oauth_access_tokens_token_index" },
    refreshToken: {
      type: "string",
      nullable: true,
      unique: "oauth_access_tokens_refresh_token_index",
    },
    expiresIn: { type: "integer", nullable: true },
    revokedAt: { type: "datetime", columnType: "timestamp(0)", nullable: true },
    scopes: { type: "string", nullable: true },
    previousRefreshToken: { type: "string" },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    description: { type: "text", nullable: true },
  },
});
