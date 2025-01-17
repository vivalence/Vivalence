import { BaseEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Runtime } from './Runtime.ts';
import { User } from './User.ts';

export class Strategy extends BaseEntity {
  id!: string;
  slug: string & Opt = '';
  version: string & Opt = '0.0.0';
  installed: boolean & Opt = false;
  name!: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  userId!: Rel<User>;
  runtimeId!: Rel<Runtime>;
  data!: unknown & Opt;
}

export const StrategySchema = new EntitySchema({
  class: Strategy,
  tableName: 'Strategy',
  uniques: [
    { name: 'Strategy_slug_runtimeId_key', properties: ['slug', 'runtimeId'] },
  ],
  properties: {
    id: { primary: true, type: 'text' },
    slug: { type: 'text' },
    version: { type: 'text' },
    installed: { type: 'boolean', columnType: 'BOOLEAN' },
    name: { type: 'text' },
    description: { type: 'text', nullable: true },
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
      kind: 'm:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    data: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
  },
});
