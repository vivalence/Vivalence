import { BaseModuleEntity, Collection, EntitySchema, type Rel } from "@mikro-orm/core";
import { AuthUsers } from "./AuthUsers.ts";
import { MfaChallenges } from "./MfaChallenges.ts";

export class MfaFactors extends BaseModuleEntity {
  id!: string;
  user!: Rel<AuthUsers>;
  friendlyName?: string;
  factorType!: MfaFactorsFactorType;
  status!: MfaFactorsStatus;
  createdAt!: Date;
  updatedAt!: Date;
  secret?: string;
  mfaChallengesCollection = new Collection<MfaChallenges>(this);
}

export enum MfaFactorsFactorType {
  TOTP = "totp",
  WEBAUTHN = "webauthn",
}

export enum MfaFactorsStatus {
  UNVERIFIED = "unverified",
  VERIFIED = "verified",
}

export const MfaFactorsSchema = new EntitySchema({
  class: MfaFactors,
  schema: "auth",
  comment: "auth: stores metadata about factors",
  indexes: [{ name: "factor_id_created_at_idx", properties: ["user", "createdAt"] }],
  uniques: [
    {
      name: "mfa_factors_user_friendly_name_unique",
      expression:
        "CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text)",
      properties: ["friendlyName", "user"],
    },
  ],
  properties: {
    id: { primary: true, type: "uuid" },
    user: {
      kind: "m:1",
      entity: () => AuthUsers,
      deleteRule: "cascade",
      index: "mfa_factors_user_id_idx",
    },
    friendlyName: { type: "text", nullable: true },
    factorType: { enum: true, items: () => MfaFactorsFactorType },
    status: { enum: true, items: () => MfaFactorsStatus },
    createdAt: { type: "datetime" },
    updatedAt: { type: "datetime" },
    secret: { type: "text", nullable: true },
    mfaChallengesCollection: {
      kind: "1:m",
      entity: () => MfaChallenges,
      mappedBy: "factor",
    },
  },
});
