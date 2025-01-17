import { BaseEntity, EntitySchema, type Rel } from '@mikro-orm/core';
import { Runtime } from './Runtime.ts';
import { User } from './User.ts';

export class RuntimeToUser extends BaseEntity {
  A!: Rel<Runtime>;
  B!: Rel<User>;
}

export const RuntimeToUserSchema = new EntitySchema({
  class: RuntimeToUser,
  tableName: '_RuntimeToUser',
  uniques: [{ name: '_RuntimeToUser_AB_unique', properties: ['A', 'B'] }],
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
    },
  },
});
