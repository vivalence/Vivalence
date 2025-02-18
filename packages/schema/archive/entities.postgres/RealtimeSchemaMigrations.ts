import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class RealtimeSchemaMigrations extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const RealtimeSchemaMigrationsSchema = new EntitySchema({
  class: RealtimeSchemaMigrations,
  tableName: "schema_migrations",
  schema: "realtime",
  properties: {
    version: { primary: true, type: "bigint", autoincrement: false },
    insertedAt: { type: "datetime", columnType: "timestamp(0)", nullable: true },
  },
});
