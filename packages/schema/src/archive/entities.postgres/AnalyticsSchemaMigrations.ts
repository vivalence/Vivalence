import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class AnalyticsSchemaMigrations extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const AnalyticsSchemaMigrationsSchema = new EntitySchema({
  class: AnalyticsSchemaMigrations,
  tableName: "schema_migrations",
  schema: "_analytics",
  properties: {
    version: { primary: true, type: "bigint", autoincrement: false },
    insertedAt: { type: "datetime", columnType: "timestamp(0)", nullable: true },
  },
});
