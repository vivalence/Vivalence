import { BaseModuleEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Sources } from './Sources.ts';

export class Rules extends BaseModuleEntity {
  id!: bigint;
  regex?: string;
  sink!: Rel<Sources>;
  source!: Rel<Sources>;
  insertedAt!: Date;
  updatedAt!: Date;
  regexStruct?: Buffer;
  lqlString: string & Opt = '';
  lqlFilters: Buffer & Opt = '\x836a';
}

export const RulesSchema = new EntitySchema({
  class: Rules,
  schema: '_analytics',
  properties: {
    id: { primary: true, type: 'bigint' },
    regex: { type: 'string', nullable: true },
    sink: {
      kind: 'm:1',
      entity: () => Sources,
      fieldName: 'sink',
      deleteRule: 'cascade',
    },
    source: {
      kind: 'm:1',
      entity: () => Sources,
      deleteRule: 'cascade',
      index: true,
    },
    insertedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    updatedAt: { type: 'datetime', columnType: 'timestamp(0)' },
    regexStruct: { type: 'blob', nullable: true },
    lqlString: { type: 'text' },
    lqlFilters: { type: 'blob' },
  },
});
