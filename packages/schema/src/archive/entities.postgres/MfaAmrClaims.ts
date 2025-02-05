import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { Sessions } from "./Sessions.ts";

export class MfaAmrClaims extends BaseModuleEntity {
  session!: Rel<Sessions>;
  createdAt!: Date;
  updatedAt!: Date;
  authenticationMethod!: string;
  id!: string;
}

export const MfaAmrClaimsSchema = new EntitySchema({
  class: MfaAmrClaims,
  schema: "auth",
  comment: "auth: stores authenticator method reference claims for multi factor authentication",
  uniques: [
    {
      name: "mfa_amr_claims_session_id_authentication_method_pkey",
      properties: ["session", "authenticationMethod"],
    },
  ],
  properties: {
    session: { kind: "m:1", entity: () => Sessions, deleteRule: "cascade" },
    createdAt: { type: "datetime" },
    updatedAt: { type: "datetime" },
    authenticationMethod: { type: "text" },
    id: { primary: true, type: "uuid" },
  },
});
