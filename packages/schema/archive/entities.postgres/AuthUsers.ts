import { BaseModuleEntity, Collection, EntitySchema, type Opt } from "@mikro-orm/core";
import { Identities } from "./Identities.ts";
import { MfaFactors } from "./MfaFactors.ts";
import { OneTimeTokens } from "./OneTimeTokens.ts";
import { Sessions } from "./Sessions.ts";

export class AuthUsers extends BaseModuleEntity {
  instanceId?: string;
  id!: string;
  aud?: string;
  role?: string;
  email?: string;
  encryptedPassword?: string;
  emailConfirmedAt?: Date;
  invitedAt?: Date;
  confirmationToken?: string;
  confirmationSentAt?: Date;
  recoveryToken?: string;
  recoverySentAt?: Date;
  emailChangeTokenNew?: string;
  emailChange?: string;
  emailChangeSentAt?: Date;
  lastSignInAt?: Date;
  rawAppMetaData?: any;
  rawUserMetaData?: any;
  isSuperAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  phone?: string;
  phoneConfirmedAt?: Date;
  phoneChange?: string = "";
  phoneChangeToken?: string = "";
  phoneChangeSentAt?: Date;
  confirmedAt?: Date;
  emailChangeTokenCurrent?: string = "";
  emailChangeConfirmStatus?: number = 0;
  bannedUntil?: Date;
  reauthenticationToken?: string = "";
  reauthenticationSentAt?: Date;
  isSsoUser: boolean & Opt = false;
  deletedAt?: Date;
  isAnonymous: boolean & Opt = false;
  identitiesCollection = new Collection<Identities>(this);
  mfaFactorsCollection = new Collection<MfaFactors>(this);
  oneTimeTokensCollection = new Collection<OneTimeTokens>(this);
  sessionsCollection = new Collection<Sessions>(this);
}

export const AuthUsersSchema = new EntitySchema({
  class: AuthUsers,
  tableName: "users",
  schema: "auth",
  comment: "Auth: Stores user login data within a secure schema.",
  indexes: [
    {
      name: "users_instance_id_email_idx",
      expression:
        "CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text))",
    },
  ],
  uniques: [
    {
      name: "confirmation_token_idx",
      expression:
        "CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text)",
      properties: ["confirmationToken"],
    },
    {
      name: "email_change_token_current_idx",
      expression:
        "CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text)",
      properties: ["emailChangeTokenCurrent"],
    },
    {
      name: "email_change_token_new_idx",
      expression:
        "CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text)",
      properties: ["emailChangeTokenNew"],
    },
    {
      name: "reauthentication_token_idx",
      expression:
        "CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text)",
      properties: ["reauthenticationToken"],
    },
    {
      name: "recovery_token_idx",
      expression:
        "CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text)",
      properties: ["recoveryToken"],
    },
    {
      name: "users_email_partial_key",
      expression:
        "CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false)",
      properties: ["email"],
    },
  ],
  properties: {
    instanceId: { type: "uuid", nullable: true, index: "users_instance_id_idx" },
    id: { primary: true, type: "uuid" },
    aud: { type: "string", nullable: true },
    role: { type: "string", nullable: true },
    email: { type: "string", nullable: true, unique: "users_email_partial_key" },
    encryptedPassword: { type: "string", nullable: true },
    emailConfirmedAt: { type: "datetime", nullable: true },
    invitedAt: { type: "datetime", nullable: true },
    confirmationToken: {
      type: "string",
      nullable: true,
      unique: "confirmation_token_idx",
    },
    confirmationSentAt: { type: "datetime", nullable: true },
    recoveryToken: {
      type: "string",
      nullable: true,
      unique: "recovery_token_idx",
    },
    recoverySentAt: { type: "datetime", nullable: true },
    emailChangeTokenNew: {
      type: "string",
      nullable: true,
      unique: "email_change_token_new_idx",
    },
    emailChange: { type: "string", nullable: true },
    emailChangeSentAt: { type: "datetime", nullable: true },
    lastSignInAt: { type: "datetime", nullable: true },
    rawAppMetaData: { type: "json", nullable: true },
    rawUserMetaData: { type: "json", nullable: true },
    isSuperAdmin: { type: "boolean", nullable: true },
    createdAt: { type: "datetime", nullable: true },
    updatedAt: { type: "datetime", nullable: true },
    phone: { type: "text", nullable: true, unique: "users_phone_key" },
    phoneConfirmedAt: { type: "datetime", nullable: true },
    phoneChange: { type: "text", nullable: true },
    phoneChangeToken: { type: "string", nullable: true },
    phoneChangeSentAt: { type: "datetime", nullable: true },
    confirmedAt: {
      type: "datetime",
      generated: "LEAST(email_confirmed_at, phone_confirmed_at) stored",
      nullable: true,
    },
    emailChangeTokenCurrent: {
      type: "string",
      nullable: true,
      unique: "email_change_token_current_idx",
    },
    emailChangeConfirmStatus: { type: "smallint", nullable: true },
    bannedUntil: { type: "datetime", nullable: true },
    reauthenticationToken: {
      type: "string",
      nullable: true,
      unique: "reauthentication_token_idx",
    },
    reauthenticationSentAt: { type: "datetime", nullable: true },
    isSsoUser: {
      type: "boolean",
      comment:
        "Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.",
    },
    deletedAt: { type: "datetime", nullable: true },
    isAnonymous: { type: "boolean", index: "users_is_anonymous_idx" },
    identitiesCollection: {
      kind: "1:m",
      entity: () => Identities,
      mappedBy: "user",
    },
    mfaFactorsCollection: {
      kind: "1:m",
      entity: () => MfaFactors,
      mappedBy: "user",
    },
    oneTimeTokensCollection: {
      kind: "1:m",
      entity: () => OneTimeTokens,
      mappedBy: "user",
    },
    sessionsCollection: { kind: "1:m", entity: () => Sessions, mappedBy: "user" },
  },
});
