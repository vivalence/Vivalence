import { BaseModuleEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { Sources } from './Sources.ts';

export class SourceBackends extends BaseModuleEntity {
  id!: bigint;
  source?: Rel<Sources>;
  type?: string;
  config?: any;
  insertedAt!: Date;
  updatedAt!: Date;
}

export const SourceBackendsSchema = new EntitySchema({
  class: SourceBackends,
  schema: '_analytics',
  properties: {
    id: { primary: true, type: 'bigint' },
    source: { kind: 'm:1', entity: () => Sources, nullable: true },
    type: { type: 'string', nullable: true },
    config: { type: 'json', nullable: true },
    insertedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    updatedAt: { type: 'datetime', columnType: 'timestamp(0)' },
  },
});
