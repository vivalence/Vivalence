import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class SchemaMigrationsA3fce3d43cef4ef481e45777218f3ecf extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrationsA3fce3d43cef4ef481e45777218f3ecfSchema = new EntitySchema({
  class: SchemaMigrationsA3fce3d43cef4ef481e45777218f3ecf,
  tableName: "schema_migrations_a3fce3d4_3cef_4ef4_81e4_5777218f3ecf",
  schema: "_analytics",
  properties: {
    version: {
      primary: true,
      type: "bigint",
      autoincrement: false,
    },
    insertedAt: {
      type: "datetime",
      columnType: "timestamp(0)",
      nullable: true,
    },
  },
});
