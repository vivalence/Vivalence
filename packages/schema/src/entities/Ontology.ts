import { BaseEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Runtime } from './Runtime.ts';

export class Ontology extends BaseEntity {
  id!: string;
  slug!: string;
  version: string & Opt = '0.0.0';
  installed: boolean & Opt = false;
  name?: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeId!: Rel<Runtime>;
}

export const OntologySchema = new EntitySchema({
  class: Ontology,
  tableName: 'Ontology',
  uniques: [
    { name: 'Ontology_slug_runtimeId_key', properties: ['slug', 'runtimeId'] },
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
      kind: '1:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      unique: 'Ontology_runtimeId_key',
    },
  },
});
