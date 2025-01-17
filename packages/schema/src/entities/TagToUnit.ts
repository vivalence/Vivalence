import { BaseEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { Tag } from './Tag.ts';
import { Unit } from './Unit.ts';

export class TagToUnit extends BaseEntity {
  A!: Rel<Tag>;
  B!: Rel<Unit>;
}

export const TagToUnitSchema = new EntitySchema({
  class: TagToUnit,
  tableName: '_TagToUnit',
  uniques: [{ name: '_TagToUnit_AB_unique', properties: ['A', 'B'] }],
  properties: {
    A: {
      kind: 'm:1',
      entity: () => Tag,
      fieldName: 'A',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    B: {
      kind: 'm:1',
      entity: () => Unit,
      fieldName: 'B',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
  },
});
