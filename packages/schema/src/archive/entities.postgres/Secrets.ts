import { BaseModuleEntity, EntitySchema, type Opt } from "@mikro-orm/core";

export class Secrets extends BaseModuleEntity {
  id!: string & Opt;
  name?: string;
  description: string & Opt = "";
  secret!: string;
  key?: string;
  nonce?: Buffer;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
}

export const SecretsSchema = new EntitySchema({
  class: Secrets,
  schema: "vault",
  comment: "Table with encrypted `secret` column for storing sensitive information on disk.",
  uniques: [
    {
      name: "secrets_name_idx",
      expression:
        "CREATE UNIQUE INDEX secrets_name_idx ON vault.secrets USING btree (name) WHERE (name IS NOT NULL)",
      properties: ["name"],
    },
  ],
  properties: {
    id: { primary: true, type: "uuid", defaultRaw: `gen_random_uuid()` },
    name: { type: "text", nullable: true, unique: "secrets_name_idx" },
    description: { type: "text" },
    secret: { type: "text" },
    key: {
      type: "uuid",
      fieldName: "key_id",
      nullable: true,
      defaultRaw: `(pgsodium.create_key()).id`,
    },
    nonce: {
      type: "blob",
      nullable: true,
      defaultRaw: `pgsodium.crypto_aead_det_noncegen()`,
    },
    createdAt: { type: "datetime", defaultRaw: `CURRENT_TIMESTAMP` },
    updatedAt: { type: "datetime", defaultRaw: `CURRENT_TIMESTAMP` },
  },
});
