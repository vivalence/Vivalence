import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class SchemaMigrations142456295f314040A5383c768ad99969 extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrations142456295f314040A5383c768ad99969Schema = new EntitySchema({
  class: SchemaMigrations142456295f314040A5383c768ad99969,
  tableName: "schema_migrations_14245629_5f31_4040_a538_3c768ad99969",
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
