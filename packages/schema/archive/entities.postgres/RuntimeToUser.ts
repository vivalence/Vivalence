import { BaseModuleEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { Runtime } from './Runtime.ts';
import { User } from './User.ts';

export class RuntimeToUser extends BaseModuleEntity {
  A!: Rel<Runtime>;
  B!: Rel<User>;
}

export const RuntimeToUserSchema = new EntitySchema({
  class: RuntimeToUser,
  tableName: '_RuntimeToUser',
  indexes: [
    {
      name: '_RuntimeToUser_B_index',
      expression: 'CREATE INDEX "_RuntimeToUser_B_index" ON public."_RuntimeToUser" USING btree ("B")',
      properties: ['B'],
    },
  ],
  uniques: [
    {
      name: '_RuntimeToUser_AB_unique',
      expression: 'CREATE UNIQUE INDEX "_RuntimeToUser_AB_unique" ON public."_RuntimeToUser" USING btree ("A", "B")',
      properties: ['A', 'B'],
    },
  ],
  properties: {
    A: {
      kind: 'm:1',
      entity: () => Runtime,
      fieldName: 'A',
      updateRule: 'cascade',
      deleteRule: 'cascade',
    },
    B: {
      kind: 'm:1',
      entity: () => User,
      fieldName: 'B',
      updateRule: 'cascade',
      deleteRule: 'cascade',
      index: true,
    },
  },
});
