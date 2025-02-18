import { BaseModuleEntity, EntitySchema, type Opt, PrimaryKeyProp } from "@mikro-orm/core";

export class SupabaseFunctionsMigrations extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: string;
  insertedAt!: Date & Opt;
}

export const SupabaseFunctionsMigrationsSchema = new EntitySchema({
  class: SupabaseFunctionsMigrations,
  tableName: "migrations",
  schema: "supabase_functions",
  properties: {
    version: { primary: true, type: "text" },
    insertedAt: { type: "datetime", defaultRaw: `now()` },
  },
});
