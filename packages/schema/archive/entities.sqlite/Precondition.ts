import { BaseEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { Dependency } from './Dependency.ts';
import { UndefinedCondition } from './UndefinedCondition.ts';

export class Precondition extends BaseEntity {
  A!: Rel<UndefinedCondition>;
  B!: Rel<Dependency>;
}

export const PreconditionSchema = new EntitySchema({
  class: Precondition,
  tableName: '_Precondition',
  uniques: [{ name: '_Precondition_AB_unique', properties: ['A', 'B'] }],
  properties: {
    A: {
      kind: 'm:1',
      entity: () => UndefinedCondition,
      fieldName: 'A',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    B: {
      kind: 'm:1',
      entity: () => Dependency,
      fieldName: 'B',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
  },
});
