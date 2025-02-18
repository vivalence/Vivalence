import { BaseModuleEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { AnalyticsUsers } from './AnalyticsUsers.ts';
import { Rules } from './Rules.ts';
import { SavedSearches } from './SavedSearches.ts';
import { SourceBackends } from './SourceBackends.ts';
import { SourceSchemas } from './SourceSchemas.ts';

export class Sources extends BaseModuleEntity {
  id!: bigint;
  name?: string;
  token!: string;
  insertedAt!: Date;
  updatedAt!: Date;
  user!: Rel<AnalyticsUsers>;
  publicToken?: string;
  favorite: boolean & Opt = false;
  bigqueryTableTtl?: number;
  apiQuota: number & Opt = 5;
  webhookNotificationUrl?: string;
  slackHookUrl?: string;
  notifications: any & Opt = '{"team_user_ids_for_sms": [], "team_user_ids_for_email": [], "user_text_notifications": false, "user_email_notifications": false, "other_email_notifications": null, "team_user_ids_for_schema_updates": [], "user_schema_update_notifications": true}';
  customEventMessageKeys?: string;
  logEventsUpdatedAt?: Date;
  bigquerySchema?: Buffer;
  notificationsEvery?: number = 14400000;
  bqTablePartitionType?: string;
  lockSchema?: boolean = false;
  validateSchema?: boolean = true;
  dropLqlFilters: Buffer & Opt = '\x836a';
  dropLqlString?: string;
  v2Pipeline?: boolean = false;
  suggestedKeys?: string = '';
  rulesCollection = new Collection<Rules>(this);
  rulesCollection1 = new Collection<Rules>(this);
  savedSearchesCollection = new Collection<SavedSearches>(this);
  sourceBackendsCollection = new Collection<SourceBackends>(this);
  sourceSchemas?: Rel<SourceSchemas>;
}

export const SourcesSchema = new EntitySchema({
  class: Sources,
  schema: '_analytics',
  uniques: [{ name: 'sources_name_index', properties: ['id', 'name'] }],
  properties: {
    id: { primary: true, type: 'bigint' },
    name: { type: 'string', nullable: true },
    token: { type: 'uuid', unique: 'sources_token_index' },
    insertedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    updatedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    user: {
      kind: 'm:1',
      entity: () => AnalyticsUsers,
      deleteRule: 'cascade',
      index: true,
    },
    publicToken: {
      type: 'string',
      nullable: true,
      unique: 'sources_public_token_index',
    },
    favorite: { type: 'boolean' },
    bigqueryTableTtl: { type: 'integer', nullable: true },
    apiQuota: { type: 'integer' },
    webhookNotificationUrl: { type: 'string', nullable: true },
    slackHookUrl: { type: 'string', nullable: true },
    notifications: { type: 'json' },
    customEventMessageKeys: { type: 'string', nullable: true },
    logEventsUpdatedAt: {
      type: 'datetime',
      columnType: 'timestamp(0)',
      nullable: true,
    },
    bigquerySchema: { type: 'blob', nullable: true },
    notificationsEvery: { type: 'integer', nullable: true },
    bqTablePartitionType: { type: 'text', nullable: true },
    lockSchema: { type: 'boolean', nullable: true },
    validateSchema: { type: 'boolean', nullable: true },
    dropLqlFilters: { type: 'blob' },
    dropLqlString: { type: 'string', nullable: true },
    v2Pipeline: { type: 'boolean', fieldName: 'v2_pipeline', nullable: true },
    suggestedKeys: { type: 'string', nullable: true },
    rulesCollection: { kind: '1:m', entity: () => Rules, mappedBy: 'sink' },
    rulesCollection1: { kind: '1:m', entity: () => Rules, mappedBy: 'source' },
    savedSearchesCollection: {
      kind: '1:m',
      entity: () => SavedSearches,
      mappedBy: 'source',
    },
    sourceBackendsCollection: {
      kind: '1:m',
      entity: () => SourceBackends,
      mappedBy: 'source',
    },
    sourceSchemas: {
      kind: '1:1',
      entity: () => SourceSchemas,
      mappedBy: 'source',
    },
  },
});
