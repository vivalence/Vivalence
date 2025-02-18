import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class SchemaMigrations430e626cDd5e4ca28d59D96bb876efe3 extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrations430e626cDd5e4ca28d59D96bb876efe3Schema = new EntitySchema({
  class: SchemaMigrations430e626cDd5e4ca28d59D96bb876efe3,
  tableName: "schema_migrations_430e626c_dd5e_4ca2_8d59_d96bb876efe3",
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
