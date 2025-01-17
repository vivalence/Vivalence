import { BaseEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Dependency } from './Dependency.ts';
import { Game } from './Game.ts';
import { Runtime } from './Runtime.ts';
import { Tactic } from './Tactic.ts';
import { User } from './User.ts';

export class Queue extends BaseEntity {
  id!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  userId!: Rel<User>;
  runtimeId!: Rel<Runtime>;
  gameId?: Rel<Game>;
  tacticId?: Rel<Tactic>;
  dependencyId?: Rel<Dependency>;
  index: number & Opt = 0;
  status: string & Opt = 'PENDING';
  data!: unknown & Opt;
}

export const QueueSchema = new EntitySchema({
  class: Queue,
  tableName: 'Queue',
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
      nullable: true,
    },
    tacticId: {
      kind: 'm:1',
      entity: () => Tactic,
      fieldName: 'tacticId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
    },
    dependencyId: {
      kind: 'm:1',
      entity: () => Dependency,
      fieldName: 'dependencyId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      nullable: true,
    },
    index: { type: 'integer' },
    status: { type: 'text' },
    data: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
  },
});
