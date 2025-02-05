import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { SsoProviders } from "./SsoProviders.ts";

export class SsoDomains extends BaseModuleEntity {
  id!: string;
  ssoProvider!: Rel<SsoProviders>;
  domain!: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const SsoDomainsSchema = new EntitySchema({
  class: SsoDomains,
  schema: "auth",
  comment: "Auth: Manages SSO email address domain mapping to an SSO Identity Provider.",
  uniques: [
    {
      name: "sso_domains_domain_idx",
      expression:
        "CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain))",
    },
  ],
  properties: {
    id: { primary: true, type: "uuid" },
    ssoProvider: {
      kind: "m:1",
      entity: () => SsoProviders,
      deleteRule: "cascade",
      index: "sso_domains_sso_provider_id_idx",
    },
    domain: { type: "text" },
    createdAt: { type: "datetime", nullable: true },
    updatedAt: { type: "datetime", nullable: true },
  },
});
