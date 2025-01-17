import { BaseEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Dependency } from './Dependency.ts';
import { Runtime } from './Runtime.ts';
import { Tag } from './Tag.ts';
import { UndefinedCondition } from './UndefinedCondition.ts';
import { Unit } from './Unit.ts';

export class Corpus extends BaseEntity {
  id!: string;
  slug!: string;
  version: string & Opt = '0.0.0';
  installed: boolean & Opt = false;
  name?: string;
  description?: string;
  icon?: unknown;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeId!: Rel<Runtime>;
  undefinedConditionCollection = new Collection<UndefinedCondition>(this);
  dependencyCollection = new Collection<Dependency>(this);
  tagCollection = new Collection<Tag>(this);
  unitCollection = new Collection<Unit>(this);
}

export const CorpusSchema = new EntitySchema({
  class: Corpus,
  tableName: 'Corpus',
  uniques: [
    { name: 'Corpus_slug_runtimeId_key', properties: ['slug', 'runtimeId'] },
  ],
  properties: {
    id: { primary: true, type: 'text' },
    slug: { type: 'text' },
    version: { type: 'text' },
    installed: { type: 'boolean', columnType: 'BOOLEAN' },
    name: { type: 'text', nullable: true },
    description: { type: 'text', nullable: true },
    icon: { type: 'unknown', columnType: 'JSONB', nullable: true },
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
    undefinedConditionCollection: {
      kind: '1:m',
      entity: () => UndefinedCondition,
      mappedBy: 'corpusId',
    },
    dependencyCollection: {
      kind: '1:m',
      entity: () => Dependency,
      mappedBy: 'corpusId',
    },
    tagCollection: { kind: '1:m', entity: () => Tag, mappedBy: 'corpusId' },
    unitCollection: { kind: '1:m', entity: () => Unit, mappedBy: 'corpusId' },
  },
});
