import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { FlowState } from "./FlowState.ts";
import { SsoProviders } from "./SsoProviders.ts";

export class SamlRelayStates extends BaseModuleEntity {
  id!: string;
  ssoProvider!: Rel<SsoProviders>;
  requestId!: string;
  forEmail?: string;
  redirectTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
  flowState?: Rel<FlowState>;
}

export const SamlRelayStatesSchema = new EntitySchema({
  class: SamlRelayStates,
  schema: "auth",
  comment: "Auth: Contains SAML Relay State information for each Service Provider initiated login.",
  properties: {
    id: { primary: true, type: "uuid" },
    ssoProvider: {
      kind: "m:1",
      entity: () => SsoProviders,
      deleteRule: "cascade",
      index: "saml_relay_states_sso_provider_id_idx",
    },
    requestId: { type: "text" },
    forEmail: {
      type: "text",
      nullable: true,
      index: "saml_relay_states_for_email_idx",
    },
    redirectTo: { type: "text", nullable: true },
    createdAt: {
      type: "datetime",
      nullable: true,
      index: "saml_relay_states_created_at_idx",
    },
    updatedAt: { type: "datetime", nullable: true },
    flowState: {
      kind: "m:1",
      entity: () => FlowState,
      deleteRule: "cascade",
      nullable: true,
    },
  },
});
