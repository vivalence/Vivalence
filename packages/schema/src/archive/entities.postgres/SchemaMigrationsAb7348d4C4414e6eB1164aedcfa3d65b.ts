import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from "@mikro-orm/core";

export class SchemaMigrationsAb7348d4C4414e6eB1164aedcfa3d65b extends BaseModuleEntity {
  [PrimaryKeyProp]?: "version";
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrationsAb7348d4C4414e6eB1164aedcfa3d65bSchema = new EntitySchema({
  class: SchemaMigrationsAb7348d4C4414e6eB1164aedcfa3d65b,
  tableName: "schema_migrations_ab7348d4_c441_4e6e_b116_4aedcfa3d65b",
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
