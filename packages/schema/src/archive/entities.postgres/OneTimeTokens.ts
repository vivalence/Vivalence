import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { AuthUsers } from "./AuthUsers.ts";

export class OneTimeTokens extends BaseModuleEntity {
  id!: string;
  user!: Rel<AuthUsers>;
  tokenType!: OneTimeTokensTokenType;
  tokenHash!: string;
  relatesTo!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
}

export enum OneTimeTokensTokenType {
  CONFIRMATION_TOKEN = "confirmation_token",
  REAUTHENTICATION_TOKEN = "reauthentication_token",
  RECOVERY_TOKEN = "recovery_token",
  EMAIL_CHANGE_TOKEN_NEW = "email_change_token_new",
  EMAIL_CHANGE_TOKEN_CURRENT = "email_change_token_current",
  PHONE_CHANGE_TOKEN = "phone_change_token",
}

export const OneTimeTokensSchema = new EntitySchema({
  class: OneTimeTokens,
  schema: "auth",
  uniques: [
    {
      name: "one_time_tokens_user_id_token_type_key",
      properties: ["user", "tokenType"],
    },
  ],
  properties: {
    id: { primary: true, type: "uuid" },
    user: { kind: "m:1", entity: () => AuthUsers, deleteRule: "cascade" },
    tokenType: { enum: true, items: () => OneTimeTokensTokenType },
    tokenHash: { type: "text", index: "one_time_tokens_token_hash_hash_idx" },
    relatesTo: { type: "text", index: "one_time_tokens_relates_to_hash_idx" },
    createdAt: {
      type: "datetime",
      columnType: "timestamp(6)",
      defaultRaw: `now()`,
    },
    updatedAt: {
      type: "datetime",
      columnType: "timestamp(6)",
      defaultRaw: `now()`,
    },
  },
});
