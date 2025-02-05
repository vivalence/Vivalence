import { BaseEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Play } from './Play.ts';
import { Runtime } from './Runtime.ts';
import { Tag } from './Tag.ts';
import { Unit } from './Unit.ts';
import { User } from './User.ts';

export class Memory extends BaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  userId!: Rel<User>;
  runtimeId!: Rel<Runtime>;
  tagId?: Rel<Tag>;
  unitId?: Rel<Unit>;
  type: string & Opt = 'BAYESIAN';
  flavor: string & Opt = 'INDIVIDUAL';
  status: string & Opt = 'UNKNOWN';
  state!: unknown & Opt;
  history!: unknown & Opt;
  signal!: unknown & Opt;
  nextIn!: string & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;
  playCollection = new Collection<Play>(this);
}

export const MemorySchema = new EntitySchema({
  class: Memory,
  tableName: 'Memory',
  uniques: [
    {
      name: 'Memory_unitId_userId_tagId_key',
      properties: ['unitId', 'userId', 'tagId'],
    },
  ],
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
      index: 'userIdIndexOnMemory',
    },
    runtimeId: {
      kind: 'm:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    tagId: {
      kind: 'm:1',
      entity: () => Tag,
      fieldName: 'tagId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
      index: 'tagIdIndexOnMemory',
    },
    unitId: {
      kind: 'm:1',
      entity: () => Unit,
      fieldName: 'unitId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
      index: 'unitIdIndexOnMemory',
    },
    type: { type: 'text' },
    flavor: { type: 'text' },
    status: { type: 'text' },
    state: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
    history: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"[]"` },
    signal: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
    nextIn: {
      type: 'decimal',
      fieldName: 'nextIn',
      columnType: 'DECIMAL',
      defaultRaw: `0.0`,
    },
    nextAt: {
      type: 'datetime',
      fieldName: 'nextAt',
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    lastAt: {
      type: 'datetime',
      fieldName: 'lastAt',
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    playCollection: { kind: '1:m', entity: () => Play, mappedBy: 'memoryId' },
  },
});
