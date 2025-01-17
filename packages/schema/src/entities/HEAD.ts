import { BaseEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Runtime } from './Runtime.ts';
import { User } from './User.ts';

export class HEAD extends BaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  userId!: Rel<User>;
  runtimeId!: Rel<Runtime>;
  data!: unknown & Opt;
}

export const HEADSchema = new EntitySchema({
  class: HEAD,
  tableName: 'HEAD',
  properties: {
    id: { primary: true, type: 'text' },
    createdAt: {
      type: 'datetime',
      fieldName: 'createdAt',
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    updatedAt: {
      type: 'datetime',
      fieldName: 'updatedAt',
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    userId: {
      kind: 'm:1',
      entity: () => User,
      fieldName: 'userId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    runtimeId: {
      kind: '1:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      unique: 'HEAD_runtimeId_key',
    },
    data: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
  },
});
