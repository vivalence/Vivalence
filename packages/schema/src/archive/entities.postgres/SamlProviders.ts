import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { SsoProviders } from "./SsoProviders.ts";

export class SamlProviders extends BaseModuleEntity {
  id!: string;
  ssoProvider!: Rel<SsoProviders>;
  entityId!: string;
  metadataXml!: string;
  metadataUrl?: string;
  attributeMapping?: any;
  createdAt?: Date;
  updatedAt?: Date;
  nameIdFormat?: string;
}

export const SamlProvidersSchema = new EntitySchema({
  class: SamlProviders,
  schema: "auth",
  comment: "Auth: Manages SAML Identity Provider connections.",
  properties: {
    id: { primary: true, type: "uuid" },
    ssoProvider: {
      kind: "m:1",
      entity: () => SsoProviders,
      deleteRule: "cascade",
      index: "saml_providers_sso_provider_id_idx",
    },
    entityId: { type: "text", unique: "saml_providers_entity_id_key" },
    metadataXml: { type: "text" },
    metadataUrl: { type: "text", nullable: true },
    attributeMapping: { type: "json", nullable: true },
    createdAt: { type: "datetime", nullable: true },
    updatedAt: { type: "datetime", nullable: true },
    nameIdFormat: { type: "text", nullable: true },
  },
});
