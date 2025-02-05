import { BaseModuleEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { Tag } from './Tag.ts';
import { Unit } from './Unit.ts';

export class TagToUnit extends BaseModuleEntity {
  A!: Rel<Tag>;
  B!: Rel<Unit>;
}

export const TagToUnitSchema = new EntitySchema({
  class: TagToUnit,
  tableName: '_TagToUnit',
  indexes: [
    {
      name: '_TagToUnit_B_index',
      expression: 'CREATE INDEX "_TagToUnit_B_index" ON public."_TagToUnit" USING btree ("B")',
      properties: ['B'],
    },
  ],
  uniques: [
    {
      name: '_TagToUnit_AB_unique',
      expression: 'CREATE UNIQUE INDEX "_TagToUnit_AB_unique" ON public."_TagToUnit" USING btree ("A", "B")',
      properties: ['A', 'B'],
    },
  ],
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
      index: true,
    },
  },
});
