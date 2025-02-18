import { BaseModuleEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { Sources } from './Sources.ts';

export class SourceSchemas extends BaseModuleEntity {
  id!: bigint;
  bigquerySchema?: Buffer;
  source?: Rel<Sources>;
  insertedAt!: Date;
  updatedAt!: Date;
  schemaFlatMap?: Buffer;
}

export const SourceSchemasSchema = new EntitySchema({
  class: SourceSchemas,
  schema: '_analytics',
  properties: {
    id: { primary: true, type: 'bigint' },
    bigquerySchema: { type: 'blob', nullable: true },
    source: {
      kind: '1:1',
      entity: () => Sources,
      deleteRule: 'cascade',
      nullable: true,
      unique: 'source_schemas_source_id_index',
    },
    insertedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    updatedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    schemaFlatMap: { type: 'blob', nullable: true },
  },
});
