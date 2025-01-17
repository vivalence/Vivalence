import { BaseEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Corpus } from './Corpus.ts';
import { Memory } from './Memory.ts';
import { Play } from './Play.ts';
import { Runtime } from './Runtime.ts';
import { TagToUnit } from './TagToUnit.ts';

export class Unit extends BaseEntity {
  id!: string;
  slug!: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeId!: Rel<Runtime>;
  corpusId?: Rel<Corpus>;
  annotation!: unknown;
  data!: unknown;
  index?: number;
  tagToUnitCollection = new Collection<TagToUnit>(this);
  memoryCollection = new Collection<Memory>(this);
  playCollection = new Collection<Play>(this);
}

export const UnitSchema = new EntitySchema({
  class: Unit,
  tableName: 'Unit',
  uniques: [
    { name: 'Unit_slug_runtimeId_key', properties: ['slug', 'runtimeId'] },
  ],
  properties: {
    id: { primary: true, type: 'text' },
    slug: { type: 'text' },
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
    annotation: { type: 'unknown', columnType: 'JSONB' },
    data: { type: 'unknown', columnType: 'JSONB' },
    index: { type: 'integer', nullable: true },
    tagToUnitCollection: { kind: '1:m', entity: () => TagToUnit, mappedBy: 'B' },
    memoryCollection: { kind: '1:m', entity: () => Memory, mappedBy: 'unitId' },
    playCollection: { kind: '1:m', entity: () => Play, mappedBy: 'unitId' },
  },
});
