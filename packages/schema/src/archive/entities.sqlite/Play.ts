import { BaseEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Game } from './Game.ts';
import { Memory } from './Memory.ts';
import { Runtime } from './Runtime.ts';
import { Tactic } from './Tactic.ts';
import { Tag } from './Tag.ts';
import { Unit } from './Unit.ts';
import { User } from './User.ts';

export class Play extends BaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  userId!: Rel<User>;
  runtimeId!: Rel<Runtime>;
  gameId!: Rel<Game>;
  tacticId?: Rel<Tactic>;
  unitId?: Rel<Unit>;
  tagId?: Rel<Tag>;
  memoryId!: Rel<Memory>;
  history!: unknown & Opt;
  signal!: unknown & Opt;
  nextIn!: string & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;
}

export const PlaySchema = new EntitySchema({
  class: Play,
  tableName: 'Play',
  uniques: [
    {
      name: 'Play_userId_unitId_tagId_gameId_tacticId_key',
      properties: ['userId', 'unitId', 'tagId', 'gameId', 'tacticId'],
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
      index: 'userIdIndexOnPlay',
    },
    runtimeId: {
      kind: 'm:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    gameId: {
      kind: 'm:1',
      entity: () => Game,
      fieldName: 'gameId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      index: 'gameIdIndexOnPlay',
    },
    tacticId: {
      kind: 'm:1',
      entity: () => Tactic,
      fieldName: 'tacticId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
      index: 'tacticIdIndexOnPlay',
    },
    unitId: {
      kind: 'm:1',
      entity: () => Unit,
      fieldName: 'unitId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
      index: 'unitIdIndexOnPlay',
    },
    tagId: {
      kind: 'm:1',
      entity: () => Tag,
      fieldName: 'tagId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
      index: 'tagIdIndexOnPlay',
    },
    memoryId: {
      kind: 'm:1',
      entity: () => Memory,
      fieldName: 'memoryId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      index: 'memoryIdIndexOnPlay',
    },
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
  },
});
