import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { BillingAccounts } from "./BillingAccounts.ts";
import { BillingCounts } from "./BillingCounts.ts";
import { EndpointQueries } from "./EndpointQueries.ts";
import { PartnerUsers } from "./PartnerUsers.ts";
import { Sources } from "./Sources.ts";
import { Teams } from "./Teams.ts";
import { VercelAuths } from "./VercelAuths.ts";

export class AnalyticsUsers extends BaseModuleEntity {
  id!: bigint;
  email!: string;
  provider!: string;
  token!: string;
  insertedAt!: Date;
  updatedAt!: Date;
  apiKey!: string;
  oldApiKey?: string;
  emailPreferred?: string;
  name?: string;
  image?: string;
  emailMeProduct: boolean & Opt = true;
  admin: boolean & Opt = false;
  phone?: string;
  bigqueryProjectId?: string;
  apiQuota: number & Opt = 125;
  bigqueryDatasetLocation?: string;
  bigqueryDatasetId?: string;
  validGoogleAccount?: boolean;
  providerUid?: string;
  company?: string;
  bigqueryUdfsHash: string & Opt = "";
  bigqueryProcessedBytesLimit: bigint & Opt = "10000000000";
  "billingEnabled?": boolean & Opt = false;
  preferences?: any;
  billingEnabled: boolean & Opt = false;
  endpointsBeta?: boolean = false;
  billingAccounts?: Rel<BillingAccounts>;
  billingCountsCollection = new Collection<BillingCounts>(this);
  endpointQueriesCollection = new Collection<EndpointQueries>(this);
  partnerUsersCollection = new Collection<PartnerUsers>(this);
  sourcesCollection = new Collection<Sources>(this);
  teams?: Rel<Teams>;
  vercelAuthsCollection = new Collection<VercelAuths>(this);
}

export const AnalyticsUsersSchema = new EntitySchema({
  class: AnalyticsUsers,
  tableName: "users",
  schema: "_analytics",
  uniques: [
    {
      name: "users_lower_email_index",
      expression:
        "CREATE UNIQUE INDEX users_lower_email_index ON _analytics.users USING btree (lower((email)::text))",
    },
  ],
  properties: {
    id: { primary: true, type: "bigint" },
    email: { type: "string" },
    provider: { type: "string" },
    token: { type: "string" },
    insertedAt: { type: "datetime", columnType: "timestamp(0)" },
    updatedAt: { type: "datetime", columnType: "timestamp(0)" },
    apiKey: { type: "string", index: "users_api_key_index" },
    oldApiKey: { type: "string", nullable: true },
    emailPreferred: { type: "string", nullable: true },
    name: { type: "string", nullable: true },
    image: { type: "string", nullable: true },
    emailMeProduct: { type: "boolean" },
    admin: { type: "boolean" },
    phone: { type: "string", nullable: true },
    bigqueryProjectId: { type: "string", nullable: true },
    apiQuota: { type: "integer" },
    bigqueryDatasetLocation: { type: "string", nullable: true },
    bigqueryDatasetId: { type: "string", nullable: true },
    validGoogleAccount: { type: "boolean", nullable: true },
    providerUid: { type: "string", nullable: true },
    company: { type: "string", nullable: true },
    bigqueryUdfsHash: { type: "string" },
    bigqueryProcessedBytesLimit: { type: "bigint" },
    "billingEnabled?": { type: "boolean" },
    preferences: { type: "json", nullable: true },
    billingEnabled: { type: "boolean" },
    endpointsBeta: { type: "boolean", nullable: true },
    billingAccounts: {
      kind: "1:1",
      entity: () => BillingAccounts,
      mappedBy: "user",
    },
    billingCountsCollection: {
      kind: "1:m",
      entity: () => BillingCounts,
      mappedBy: "user",
    },
    endpointQueriesCollection: {
      kind: "1:m",
      entity: () => EndpointQueries,
      mappedBy: "user",
    },
    partnerUsersCollection: {
      kind: "1:m",
      entity: () => PartnerUsers,
      mappedBy: "user",
    },
    sourcesCollection: { kind: "1:m", entity: () => Sources, mappedBy: "user" },
    teams: { kind: "1:1", entity: () => Teams, mappedBy: "user" },
    vercelAuthsCollection: {
      kind: "1:m",
      entity: () => VercelAuths,
      mappedBy: "user",
    },
  },
});
