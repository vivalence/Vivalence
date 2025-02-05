import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class SchemaMigrations197acdcbD87641488a16E48ed4bd7213 extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrations197acdcbD87641488a16E48ed4bd7213Schema = new EntitySchema({
  class: SchemaMigrations197acdcbD87641488a16E48ed4bd7213,
  tableName: "schema_migrations_197acdcb_d876_4148_8a16_e48ed4bd7213",
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
