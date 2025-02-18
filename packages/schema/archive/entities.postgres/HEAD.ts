import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Runtime } from './Runtime.ts';
import { User } from './User.ts';

export class HEAD extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  data: any & Opt = '{}';
  userId!: Rel<User>;
  runtimeId!: Rel<Runtime>;
}

export const HEADSchema = new EntitySchema({
  class: HEAD,
  tableName: 'HEAD',
  uniques: [
    {
      name: 'HEAD_runtimeId_key',
      expression: 'CREATE UNIQUE INDEX "HEAD_runtimeId_key" ON public."HEAD" USING btree ("runtimeId")',
      properties: ['runtimeId'],
    },
  ],
  properties: {
    id: { primary: true, type: 'text', defaultRaw: `uuid_generate_v4()` },
    createdAt: {
      type: 'datetime',
      fieldName: 'createdAt',
      columnType: 'timestamp(3)',
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    updatedAt: {
      type: 'datetime',
      fieldName: 'updatedAt',
      columnType: 'timestamp(3)',
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    data: { type: 'json' },
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
  },
});
