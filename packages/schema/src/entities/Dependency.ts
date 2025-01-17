import { BaseEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Corpus } from './Corpus.ts';
import { Precondition } from './Precondition.ts';
import { Queue } from './Queue.ts';
import { Runtime } from './Runtime.ts';
import { UndefinedCondition } from './UndefinedCondition.ts';

export class Dependency extends BaseEntity {
  id!: string;
  slug!: string;
  name!: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeId!: Rel<Runtime>;
  corpusId?: Rel<Corpus>;
  itinerary!: unknown & Opt;
  available: boolean & Opt = false;
  satisfied: boolean & Opt = false;
  undefinedConditionCollection = new Collection<UndefinedCondition>(this);
  preconditionCollection = new Collection<Precondition>(this);
  queueCollection = new Collection<Queue>(this);
}

export const DependencySchema = new EntitySchema({
  class: Dependency,
  tableName: 'Dependency',
  uniques: [
    { name: 'Dependency_slug_runtimeId_key', properties: ['slug', 'runtimeId'] },
  ],
  properties: {
    id: { primary: true, type: 'text' },
    slug: { type: 'text' },
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
    runtimeId: {
      kind: 'm:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    corpusId: {
      kind: 'm:1',
      entity: () => Corpus,
      fieldName: 'corpusId',
      updateRule: 'cascade',
      deleteRule: 'set null',
      nullable: true,
    },
    itinerary: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
    available: { type: 'boolean', columnType: 'BOOLEAN' },
    satisfied: { type: 'boolean', columnType: 'BOOLEAN' },
    undefinedConditionCollection: {
      kind: '1:m',
      entity: () => UndefinedCondition,
      mappedBy: 'B',
    },
    preconditionCollection: {
      kind: '1:m',
      entity: () => Precondition,
      mappedBy: 'B',
    },
    queueCollection: {
      kind: '1:m',
      entity: () => Queue,
      mappedBy: 'dependencyId',
    },
  },
});
