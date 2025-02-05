import { BaseEntity, Collection, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Corpus } from './Corpus.ts';
import { Memory } from './Memory.ts';
import { Play } from './Play.ts';
import { Runtime } from './Runtime.ts';
import { TagToUnit } from './TagToUnit.ts';

export class Tag extends BaseEntity {
  id!: string;
  slug!: string;
  name!: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeId!: Rel<Runtime>;
  corpusId?: Rel<Corpus>;
  traits!: unknown;
  data!: unknown;
  tagToUnitCollection = new Collection<TagToUnit>(this);
  memoryCollection = new Collection<Memory>(this);
  playCollection = new Collection<Play>(this);
}

export const TagSchema = new EntitySchema({
  class: Tag,
  tableName: 'Tag',
  uniques: [{ name: 'Tag_slug_runtimeId_key', properties: ['slug', 'runtimeId'] }],
  properties: {
    id: { primary: true, type: 'text' },
    slug: { type: 'text' },
    name: { type: 'text', index: 'nameIndexOnTag' },
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
    traits: { type: 'unknown', columnType: 'JSONB' },
    data: { type: 'unknown', columnType: 'JSONB' },
    tagToUnitCollection: { kind: '1:m', entity: () => TagToUnit, mappedBy: 'A' },
    memoryCollection: { kind: '1:m', entity: () => Memory, mappedBy: 'tagId' },
    playCollection: { kind: '1:m', entity: () => Play, mappedBy: 'tagId' },
  },
});
