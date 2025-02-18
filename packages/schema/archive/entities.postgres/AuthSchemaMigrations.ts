import { BaseModuleEntity, EntitySchema, PrimaryKeyProp } from '@mikro-orm/core';

export class AuthSchemaMigrations extends BaseModuleEntity {
  [PrimaryKeyProp]?: 'version';
  version!: string;
}

export const AuthSchemaMigrationsSchema = new EntitySchema({
  class: AuthSchemaMigrations,
  tableName: 'schema_migrations',
  schema: 'auth',
  comment: 'Auth: Manages updates to the auth system.',
  properties: {
    version: { primary: true, type: 'string' },
  },
});
