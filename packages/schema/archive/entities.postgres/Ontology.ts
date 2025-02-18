import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Runtime } from './Runtime.ts';

export class Ontology extends BaseModuleEntity {
  id!: string & Opt;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  name?: string;
  version: string & Opt = '0.0.0';
  installed: boolean & Opt = false;
  slug!: string;
  runtimeId!: Rel<Runtime>;
  description?: string;
}

export const OntologySchema = new EntitySchema({
  class: Ontology,
  tableName: 'Ontology',
  uniques: [
    {
      name: 'Ontology_runtimeId_key',
      expression: 'CREATE UNIQUE INDEX "Ontology_runtimeId_key" ON public."Ontology" USING btree ("runtimeId")',
      properties: ['runtimeId'],
    },
    {
      name: 'Ontology_slug_runtimeId_key',
      expression: 'CREATE UNIQUE INDEX "Ontology_slug_runtimeId_key" ON public."Ontology" USING btree (slug, "runtimeId")',
      properties: ['slug', 'runtimeId'],
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
    name: { type: 'text', nullable: true },
    version: { type: 'text' },
    installed: { type: 'boolean' },
    slug: { type: 'text' },
    runtimeId: {
      kind: '1:1',
      entity: () => Runtime,
      fieldName: 'runtimeId',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      unique: 'Ontology_runtimeId_key',
    },
    description: { type: 'text', nullable: true },
  },
});
