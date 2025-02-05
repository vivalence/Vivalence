import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { AnalyticsUsers } from './AnalyticsUsers.ts';

export class EndpointQueries extends BaseModuleEntity {
  id!: bigint;
  name?: string;
  token?: string;
  query?: string;
  user?: Rel<AnalyticsUsers>;
  insertedAt!: Date;
  updatedAt!: Date;
  sourceMapping: any & Opt = '{}';
  sandboxable?: boolean = false;
  cacheDurationSeconds?: number = 3600;
  proactiveRequeryingSeconds?: number = 1800;
  maxLimit?: number = 1000;
  enableAuth?: boolean = false;
  sandboxQuery?: Rel<EndpointQueries>;
  language!: string;
  endpointQueriesCollection = new Collection<EndpointQueries>(this);
}

export const EndpointQueriesSchema = new EntitySchema({
  class: EndpointQueries,
  schema: '_analytics',
  properties: {
    id: { primary: true, type: 'bigint' },
    name: { type: 'string', nullable: true },
    token: {
      type: 'uuid',
      nullable: true,
      unique: 'endpoint_queries_token_index',
    },
    query: { type: 'text', nullable: true },
    user: {
      kind: 'm:1',
      entity: () => AnalyticsUsers,
      nullable: true,
      index: true,
    },
    insertedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    updatedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    sourceMapping: { type: 'json' },
    sandboxable: { type: 'boolean', nullable: true },
    cacheDurationSeconds: { type: 'integer', nullable: true },
    proactiveRequeryingSeconds: { type: 'integer', nullable: true },
    maxLimit: { type: 'integer', nullable: true },
    enableAuth: { type: 'boolean', nullable: true },
    sandboxQuery: { kind: 'm:1', entity: () => EndpointQueries, nullable: true },
    language: { type: 'string' },
    endpointQueriesCollection: {
      kind: '1:m',
      entity: () => EndpointQueries,
      mappedBy: 'sandboxQuery',
    },
  },
});
