import { BaseModuleEntity, Collection, EntitySchema } from "@mikro-orm/core";
import { SamlProviders } from "./SamlProviders.ts";
import { SamlRelayStates } from "./SamlRelayStates.ts";
import { SsoDomains } from "./SsoDomains.ts";

export class SsoProviders extends BaseModuleEntity {
  id!: string;
  resourceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  samlProvidersCollection = new Collection<SamlProviders>(this);
  samlRelayStatesCollection = new Collection<SamlRelayStates>(this);
  ssoDomainsCollection = new Collection<SsoDomains>(this);
}

export const SsoProvidersSchema = new EntitySchema({
  class: SsoProviders,
  schema: "auth",
  comment: "Auth: Manages SSO identity provider information; see saml_providers for SAML.",
  uniques: [
    {
      name: "sso_providers_resource_id_idx",
      expression:
        "CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id))",
    },
  ],
  properties: {
    id: { primary: true, type: "uuid" },
    resourceId: {
      type: "text",
      nullable: true,
      comment:
        "Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.",
    },
    createdAt: { type: "datetime", nullable: true },
    updatedAt: { type: "datetime", nullable: true },
    samlProvidersCollection: {
      kind: "1:m",
      entity: () => SamlProviders,
      mappedBy: "ssoProvider",
    },
    samlRelayStatesCollection: {
      kind: "1:m",
      entity: () => SamlRelayStates,
      mappedBy: "ssoProvider",
    },
    ssoDomainsCollection: {
      kind: "1:m",
      entity: () => SsoDomains,
      mappedBy: "ssoProvider",
    },
  },
});
