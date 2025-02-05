import { BaseEntity, EntitySchema, type Opt, type Rel } from '@mikro-orm/core';
import { Corpus } from './Corpus.ts';
import { Runtime } from './Runtime.ts';

export class UndefinedCondition extends BaseEntity {
  id!: string;
  name?: string;
  description?: string;
  createdAt!: Date & Opt;
  updatedAt!: Date & Opt;
  runtimeId!: Rel<Runtime>;
  corpusId?: Rel<Corpus>;
  scope!: unknown & Opt;
  assertion!: unknown & Opt;
  met: boolean & Opt = false;
}

export const UndefinedConditionSchema = new EntitySchema({
  class: UndefinedCondition,
  tableName: 'Condition',
  properties: {
    id: { primary: true, type: 'text' },
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
    corpusId: {
      kind: 'm:1',
      entity: () => Corpus,
      fieldName: 'corpusId',
      updateRule: 'cascade',
      deleteRule: 'set null',
      nullable: true,
    },
    scope: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
    assertion: { type: 'unknown', columnType: 'JSONB', defaultRaw: `"{}"` },
    met: { type: 'boolean', columnType: 'BOOLEAN' },
  },
});
