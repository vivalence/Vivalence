import { BaseModuleEntity, Collection, EntitySchema, type Opt } from "@mikro-orm/core";
import { OauthAccessGrants } from "./OauthAccessGrants.ts";
import { OauthAccessTokens } from "./OauthAccessTokens.ts";

export class OauthApplications extends BaseModuleEntity {
  id!: bigint;
  ownerId!: number;
  name!: string;
  uid!: string;
  secret: string & Opt = "";
  redirectUri!: string;
  scopes: string & Opt = "";
  insertedAt!: Date;
  updatedAt!: Date;
  oauthAccessGrantsCollection = new Collection<OauthAccessGrants>(this);
  oauthAccessTokensCollection = new Collection<OauthAccessTokens>(this);
}

export const OauthApplicationsSchema = new EntitySchema({
  class: OauthApplications,
  schema: "_analytics",
  properties: {
    id: { primary: true, type: "bigint" },
    ownerId: { type: "integer", index: "oauth_applications_owner_id_index" },
    name: { type: "string" },
    uid: { type: "string", unique: "oauth_applications_uid_index" },
    secret: { type: "string" },
    redirectUri: { type: "string" },
    scopes: { type: "string" },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    oauthAccessGrantsCollection: {
      kind: "1:m",
      entity: () => OauthAccessGrants,
      mappedBy: "application",
    },
    oauthAccessTokensCollection: {
      kind: "1:m",
      entity: () => OauthAccessTokens,
      mappedBy: "application",
    },
  },
});
