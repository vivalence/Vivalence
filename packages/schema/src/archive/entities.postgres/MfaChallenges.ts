import { BaseModuleEntity, EntitySchema, type Rel } from "@mikro-orm/core";
import { MfaFactors } from "./MfaFactors.ts";

export class MfaChallenges extends BaseModuleEntity {
  id!: string;
  factor!: Rel<MfaFactors>;
  createdAt!: Date;
  verifiedAt?: Date;
  ipAddress!: unknown;
}

export const MfaChallengesSchema = new EntitySchema({
  class: MfaChallenges,
  schema: "auth",
  comment: "auth: stores metadata about challenge requests made",
  properties: {
    id: { primary: true, type: "uuid" },
    factor: { kind: "m:1", entity: () => MfaFactors, deleteRule: "cascade" },
    createdAt: { type: "datetime", index: "mfa_challenge_created_at_idx" },
    verifiedAt: { type: "datetime", nullable: true },
    ipAddress: { type: "unknown", columnType: "inet" },
  },
});
