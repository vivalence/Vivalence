import { BaseModuleEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { AnalyticsUsers } from './AnalyticsUsers.ts';

export class VercelAuths extends BaseModuleEntity {
  id!: bigint;
  accessToken?: string;
  installationId?: string;
  teamId?: string;
  tokenType?: string;
  vercelUserId?: string;
  user?: Rel<AnalyticsUsers>;
  insertedAt!: Date;
  updatedAt!: Date;
}

export const VercelAuthsSchema = new EntitySchema({
  class: VercelAuths,
  schema: '_analytics',
  properties: {
    id: { primary: true, type: 'bigint' },
    accessToken: { type: 'string', nullable: true },
    installationId: { type: 'string', nullable: true },
    teamId: { type: 'string', nullable: true },
    tokenType: { type: 'string', nullable: true },
    vercelUserId: { type: 'string', nullable: true },
    user: {
      kind: 'm:1',
      entity: () => AnalyticsUsers,
      deleteRule: 'cascade',
      nullable: true,
    },
    insertedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    updatedAt: { type: 'datetime', columnType: 'timestamp(0)' },
  },
});
