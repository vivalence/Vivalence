import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class SchemaMigrations0ba6161698d647ea902969bfbd26450d extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrations0ba6161698d647ea902969bfbd26450dSchema = new EntitySchema({
  class: SchemaMigrations0ba6161698d647ea902969bfbd26450d,
  tableName: "schema_migrations_0ba61616_98d6_47ea_9029_69bfbd26450d",
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
