import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class SchemaMigrationsD2d4a4ba842c425eB01a6bb4ab028c78 extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrationsD2d4a4ba842c425eB01a6bb4ab028c78Schema = new EntitySchema({
  class: SchemaMigrationsD2d4a4ba842c425eB01a6bb4ab028c78,
  tableName: "schema_migrations_d2d4a4ba_842c_425e_b01a_6bb4ab028c78",
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
