import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { AuthUsers } from "./AuthUsers.ts";

export class Identities extends BaseModuleEntity {
  providerId!: string;
  user!: Rel<AuthUsers>;
  identityData!: any;
  provider!: string;
  lastSignInAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  email?: string;
  id!: string & Opt;
}

export const IdentitiesSchema = new EntitySchema({
  class: Identities,
  schema: "auth",
  comment: "Auth: Stores identities associated to a user.",
  uniques: [
    {
      name: "identities_provider_id_provider_unique",
      properties: ["providerId", "provider"],
    },
  ],
  properties: {
    providerId: { type: "text" },
    user: {
      kind: "m:1",
      entity: () => AuthUsers,
      deleteRule: "cascade",
      index: "identities_user_id_idx",
    },
    identityData: { type: "json" },
    provider: { type: "text" },
    lastSignInAt: { type: "datetime", nullable: true },
    createdAt: { type: "datetime", nullable: true },
    updatedAt: { type: "datetime", nullable: true },
    email: {
      type: "text",
      generated: "lower((identity_data ->> 'email'::text)) stored",
      nullable: true,
      comment:
        "Auth: Email is a generated column that references the optional email property in the identity_data",
      index: "identities_email_idx",
    },
    id: { primary: true, type: "uuid", defaultRaw: `gen_random_uuid()` },
  },
});
