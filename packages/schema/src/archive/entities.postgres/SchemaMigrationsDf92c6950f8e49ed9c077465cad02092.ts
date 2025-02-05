import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from '@mikro-orm/core';

export class SchemaMigrationsDf92c6950f8e49ed9c077465cad02092 extends BaseModuleEntity {
  [PrimaryKeyProp]?: 'version';
  version!: bigint;
  insertedAt?: Date;
}

export const SchemaMigrationsDf92c6950f8e49ed9c077465cad02092Schema = new EntitySchema({
  class: SchemaMigrationsDf92c6950f8e49ed9c077465cad02092,
  tableName: 'schema_migrations_df92c695_0f8e_49ed_9c07_7465cad02092',
  schema: '_analytics',
  properties: {
    version: {
      primary: true,
      type: 'bigint',
      autoincrement: false,
    },
    insertedAt: {
      type: 'datetime',
      columnType: 'timestamp(0)',
      nullable: true,
    },
  },
});
