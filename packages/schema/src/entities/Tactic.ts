import { BaseEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Play } from './Play.ts';
import { Queue } from './Queue.ts';
import { Runtime } from './Runtime.ts';

export class Tactic extends BaseEntity {
  id!: string;
  slug!: string;
  version: string & Opt = '0.0.0';
  installed: boolean & Opt = false;
  name?: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeId!: Rel<Runtime>;
  relations!: unknown & Opt;
  masks!: unknown & Opt;
  playCollection = new Collection<Play>(this);
  queueCollection = new Collection<Queue>(this);
}

export const TacticSchema = new EntitySchema({
  class: Tactic,
  tableName: 'Tactic',
  uniques: [
    { name: 'Tactic_slug_runtimeId_key', properties: ['slug', 'runtimeId'] },
  ],
  properties: {
    id: { primary: true, type: 'text' },
    slug: { type: 'text' },
    version: { type: 'text' },
    installed: { type: 'boolean', columnType: 'BOOLEAN' },
    name: { type: 'text', nullable: true },
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
    runtimeId: {
      kind: 'm:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    relations: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
    masks: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
    playCollection: { kind: '1:m', entity: () => Play, mappedBy: 'tacticId' },
    queueCollection: { kind: '1:m', entity: () => Queue, mappedBy: 'tacticId' },
  },
});
