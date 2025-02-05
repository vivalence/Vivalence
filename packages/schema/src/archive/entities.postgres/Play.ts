import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Game } from './Game.ts';
import { Memory } from './Memory.ts';
import { Runtime } from './Runtime.ts';
import { Tactic } from './Tactic.ts';
import { Tag } from './Tag.ts';
import { Unit } from './Unit.ts';
import { User } from './User.ts';

export class Play extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  history: any & Opt = '[]';
  unitId?: Rel<Unit>;
  gameId!: Rel<Game>;
  userId!: Rel<User>;
  memoryId!: Rel<Memory>;
  tagId?: Rel<Tag>;
  tacticId?: Rel<Tactic>;
  runtimeId!: Rel<Runtime>;
  lastAt!: Date & Opt;
  nextAt!: Date & Opt;
  nextIn!: string & Opt;
  signal: any & Opt = '{}';
}

export const PlaySchema = new EntitySchema({
  class: Play,
  tableName: 'Play',
  indexes: [
    {
      name: 'gameIdIndexOnPlay',
      expression: 'CREATE INDEX "gameIdIndexOnPlay" ON public."Play" USING btree ("gameId")',
      properties: ['gameId'],
    },
    {
      name: 'memoryIdIndexOnPlay',
      expression: 'CREATE INDEX "memoryIdIndexOnPlay" ON public."Play" USING btree ("memoryId")',
      properties: ['memoryId'],
    },
    {
      name: 'tacticIdIndexOnPlay',
      expression: 'CREATE INDEX "tacticIdIndexOnPlay" ON public."Play" USING btree ("tacticId")',
      properties: ['tacticId'],
    },
    {
      name: 'tagIdIndexOnPlay',
      expression: 'CREATE INDEX "tagIdIndexOnPlay" ON public."Play" USING btree ("tagId")',
      properties: ['tagId'],
    },
    {
      name: 'unitIdIndexOnPlay',
      expression: 'CREATE INDEX "unitIdIndexOnPlay" ON public."Play" USING btree ("unitId")',
      properties: ['unitId'],
    },
    {
      name: 'userIdIndexOnPlay',
      expression: 'CREATE INDEX "userIdIndexOnPlay" ON public."Play" USING btree ("userId")',
      properties: ['userId'],
    },
  ],
  uniques: [
    {
      name: 'Play_userId_unitId_tagId_gameId_tacticId_key',
      expression: 'CREATE UNIQUE INDEX "Play_userId_unitId_tagId_gameId_tacticId_key" ON public."Play" USING btree ("userId", "unitId", "tagId", "gameId", "tacticId")',
      properties: ['userId', 'unitId', 'tagId', 'gameId', 'tacticId'],
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
    history: { type: 'json' },
    unitId: {
      kind: 'm:1',
      entity: () => Unit,
      fieldName: 'unitId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
      index: 'unitIdIndexOnPlay',
    },
    gameId: {
      kind: 'm:1',
      entity: () => Game,
      fieldName: 'gameId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      index: 'gameIdIndexOnPlay',
    },
    userId: {
      kind: 'm:1',
      entity: () => User,
      fieldName: 'userId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      index: 'userIdIndexOnPlay',
    },
    memoryId: {
      kind: 'm:1',
      entity: () => Memory,
      fieldName: 'memoryId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      index: 'memoryIdIndexOnPlay',
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
    tacticId: {
      kind: 'm:1',
      entity: () => Tactic,
      fieldName: 'tacticId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
      index: 'tacticIdIndexOnPlay',
    },
    runtimeId: {
      kind: 'm:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    lastAt: {
      type: 'datetime',
      fieldName: 'lastAt',
      columnType: 'timestamp(3)',
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    nextAt: {
      type: 'datetime',
      fieldName: 'nextAt',
      columnType: 'timestamp(3)',
      defaultRaw: `CURRENT_TIMESTAMP`,
    },
    nextIn: {
      type: 'decimal',
      fieldName: 'nextIn',
      precision: 65,
      scale: 30,
      defaultRaw: `0.0`,
    },
    signal: { type: 'json' },
  },
});
