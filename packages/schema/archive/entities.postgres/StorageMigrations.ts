import { BaseModuleEntity, EntitySchema } from "@mikro-orm/core";

export class StorageMigrations extends BaseModuleEntity {
  id!: number;
  name!: string;
  hash!: string;
  executedAt?: Date;
}

export const StorageMigrationsSchema = new EntitySchema({
  class: StorageMigrations,
  tableName: "migrations",
  schema: "storage",
  properties: {
    id: { primary: true, type: "integer", autoincrement: false },
    name: { type: "string", length: 100, unique: "migrations_name_key" },
    hash: { type: "string", length: 40 },
    executedAt: {
      type: "datetime",
      columnType: "timestamp(6)",
      nullable: true,
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
  },
});
