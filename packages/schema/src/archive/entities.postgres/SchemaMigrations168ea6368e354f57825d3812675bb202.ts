import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class SchemaMigrations168ea6368e354f57825d3812675bb202 extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrations168ea6368e354f57825d3812675bb202Schema = new EntitySchema({
  class: SchemaMigrations168ea6368e354f57825d3812675bb202,
  tableName: "schema_migrations_168ea636_8e35_4f57_825d_3812675bb202",
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
