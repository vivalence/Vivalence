import { BaseModuleEntity, Collection, EntitySchema } from '@mikro-orm/core';
import { PartnerUsers } from './PartnerUsers.ts';

export class Partners extends BaseModuleEntity {
  id!: bigint;
  name?: Buffer;
  token?: Buffer;
  partnerUsersCollection = new Collection<PartnerUsers>(this);
}

export const PartnersSchema = new EntitySchema({
  class: Partners,
  schema: '_analytics',
  properties: {
    id: { primary: true, type: 'bigint' },
    name: { type: 'blob', nullable: true },
    token: { type: 'blob', nullable: true },
    partnerUsersCollection: {
      kind: '1:m',
      entity: () => PartnerUsers,
      mappedBy: 'partner',
    },
  },
});
