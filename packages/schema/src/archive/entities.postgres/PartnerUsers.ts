import { BaseModuleEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { AnalyticsUsers } from './AnalyticsUsers.ts';
import { Partners } from './Partners.ts';

export class PartnerUsers extends BaseModuleEntity {
  id!: bigint;
  partner?: Rel<Partners>;
  user?: Rel<AnalyticsUsers>;
}

export const PartnerUsersSchema = new EntitySchema({
  class: PartnerUsers,
  schema: '_analytics',
  uniques: [
    {
      name: 'partner_users_partner_id_user_id_index',
      properties: ['partner', 'user'],
    },
  ],
  properties: {
    id: { primary: true, type: 'bigint' },
    partner: { kind: 'm:1', entity: () => Partners, nullable: true },
    user: { kind: 'm:1', entity: () => AnalyticsUsers, nullable: true },
  },
});
