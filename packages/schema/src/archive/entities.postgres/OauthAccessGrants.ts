import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { OauthApplications } from "./OauthApplications.ts";

export class OauthAccessGrants extends BaseModuleEntity {
  id!: bigint;
  resourceOwnerId!: number;
  application?: Rel<OauthApplications>;
  token!: string;
  expiresIn!: number;
  redirectUri!: string;
  revokedAt?: Date;
  scopes?: string;
  insertedAt!: Date;
}

export const OauthAccessGrantsSchema = new EntitySchema({
  class: OauthAccessGrants,
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "bigint" },
    resourceOwnerId: { type: "integer" },
    application: { kind: "m:1", entity: () => OauthApplications, nullable: true },
    token: { type: "string", unique: "oauth_access_grants_token_index" },
    expiresIn: { type: "integer" },
    redirectUri: { type: "text" },
    revokedAt: { type: "datetime", columnType: "timestamp(0)", nullable: true },
    scopes: { type: "string", nullable: true },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
  },
});
