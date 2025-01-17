import { BaseEntity, Collection, EntitySchema, type Opt } from '@mikro-orm/core';
import { HEAD } from './HEAD.ts';
import { Memory } from './Memory.ts';
import { Play } from './Play.ts';
import { Queue } from './Queue.ts';
import { RuntimeToUser } from './RuntimeToUser.ts';
import { Strategy } from './Strategy.ts';

export class User extends BaseEntity {
  id!: string;
  roles!: unknown & Opt;
  config!: unknown & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeToUserCollection = new Collection<RuntimeToUser>(this);
  hEADCollection = new Collection<HEAD>(this);
  memoryCollection = new Collection<Memory>(this);
  playCollection = new Collection<Play>(this);
  queueCollection = new Collection<Queue>(this);
  strategyCollection = new Collection<Strategy>(this);
}

export const UserSchema = new EntitySchema({
  class: User,
  tableName: 'User',
  properties: {
    id: { primary: true, type: 'text' },
    roles: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"[]"` },
    config: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
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
    runtimeToUserCollection: {
      kind: '1:m',
      entity: () => RuntimeToUser,
      mappedBy: 'B',
    },
    hEADCollection: { kind: '1:m', entity: () => HEAD, mappedBy: 'userId' },
    memoryCollection: { kind: '1:m', entity: () => Memory, mappedBy: 'userId' },
    playCollection: { kind: '1:m', entity: () => Play, mappedBy: 'userId' },
    queueCollection: { kind: '1:m', entity: () => Queue, mappedBy: 'userId' },
    strategyCollection: {
      kind: '1:m',
      entity: () => Strategy,
      mappedBy: 'userId',
    },
  },
});
