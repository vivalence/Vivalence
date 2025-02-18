import { BaseModuleEntity, Collection, EntitySchema, type Rel } from "@mikro-orm/core";
import { AuthUsers } from "./AuthUsers.ts";
import { MfaAmrClaims } from "./MfaAmrClaims.ts";
import { RefreshTokens } from "./RefreshTokens.ts";

export class Sessions extends BaseModuleEntity {
  id!: string;
  user!: Rel<AuthUsers>;
  createdAt?: Date;
  updatedAt?: Date;
  factorId?: string;
  aal?: SessionsAal;
  notAfter?: Date;
  refreshedAt?: Date;
  userAgent?: string;
  ip?: unknown;
  tag?: string;
  mfaAmrClaimsCollection = new Collection<MfaAmrClaims>(this);
  refreshTokensCollection = new Collection<RefreshTokens>(this);
}

export enum SessionsAal {
  AAL1 = "aal1",
  AAL2 = "aal2",
  AAL3 = "aal3",
}

export const SessionsSchema = new EntitySchema({
  class: Sessions,
  schema: "auth",
  comment: "Auth: Stores session data associated to a user.",
  indexes: [{ name: "user_id_created_at_idx", properties: ["user", "createdAt"] }],
  properties: {
    id: { primary: true, type: "uuid" },
    user: {
      kind: "m:1",
      entity: () => AuthUsers,
      deleteRule: "cascade",
      index: "sessions_user_id_idx",
    },
    createdAt: { type: "datetime", nullable: true },
    updatedAt: { type: "datetime", nullable: true },
    factorId: { type: "uuid", nullable: true },
    aal: { enum: true, items: () => SessionsAal, nullable: true },
    notAfter: {
      type: "datetime",
      nullable: true,
      comment:
        "Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.",
      index: "sessions_not_after_idx",
    },
    refreshedAt: { type: "datetime", columnType: "timestamp(6)", nullable: true },
    userAgent: { type: "text", nullable: true },
    ip: { type: "unknown", columnType: "inet", nullable: true },
    tag: { type: "text", nullable: true },
    mfaAmrClaimsCollection: {
      kind: "1:m",
      entity: () => MfaAmrClaims,
      mappedBy: "session",
    },
    refreshTokensCollection: {
      kind: "1:m",
      entity: () => RefreshTokens,
      mappedBy: "session",
    },
  },
});
