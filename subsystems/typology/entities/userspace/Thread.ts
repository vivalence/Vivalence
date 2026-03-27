import { EntitySchema, Collection, types, type Opt, type Rel } from "@mikro-orm/core";

import { DataEntity, DataSchema } from "../index.ts";
import { UserEntity } from "../index.ts";
import { ModeEntity } from "../index.ts";
import { IntentEntity } from "../index.ts";
import { BufferEntity } from "../index.ts";

export enum ThreadTraitsEnum {
  _ = "_",
}

export class ThreadEntity extends DataEntity {
  user!: Rel<UserEntity>;
  mode!: Rel<ModeEntity>;
  intent?: Rel<IntentEntity>;
  traits: ThreadTraitsEnum[] & Opt = [];
  trait: any & Opt = {};
  cursor: number & Opt = 0;
  counter: number & Opt = 0;

  buffers = new Collection<BufferEntity>(this);
}

export const ThreadSchema = new EntitySchema<ThreadEntity, DataEntity>({
  class: ThreadEntity,
  extends: DataSchema,
  tableName: "Thread",
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    intent: {
      kind: "m:1",
      entity: () => IntentEntity,
      fieldName: "intent",
      nullable: true,
    },

    traits: {
      columnType: "json",
      defaultRaw: `'[]'`,
      enum: true,
      array: true,
      items: () => ThreadTraitsEnum,
    },
    trait: { type: types.json },
    counter: { type: types.integer },
    cursor: { type: types.integer },

    buffers: {
      kind: "1:m",
      entity: () => BufferEntity,
      mappedBy: (buffer) => buffer.thread,
    },
  },
});
export default {
  type: "thread",
  schema: ThreadSchema,
  entity: ThreadEntity,
};
