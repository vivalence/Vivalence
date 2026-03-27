import { EntitySchema, Collection, types, type Opt, type Rel } from "@mikro-orm/core";

import { DataEntity, DataSchema } from "../index.ts";
import { UserEntity } from "../index.ts";
import { ModeEntity } from "../index.ts";
import { IntentEntity } from "../index.ts";
import { BufferEntity } from "../index.ts";

export enum SessionTraitsEnum {
  _ = "_",
}

export class SessionEntity extends DataEntity {
  user!: Rel<UserEntity>;
  mode!: Rel<ModeEntity>;
  intent?: Rel<IntentEntity>;
  traits: SessionTraitsEnum[] & Opt = [];
  trait: any & Opt = {};
  cursor: number & Opt = 0;
  counter: number & Opt = 0;

  buffers = new Collection<BufferEntity>(this);
}

export const SessionSchema = new EntitySchema<SessionEntity, DataEntity>({
  class: SessionEntity,
  extends: DataSchema,
  tableName: "Session",
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
      items: () => SessionTraitsEnum,
    },
    trait: { type: types.json },
    counter: { type: types.integer },
    cursor: { type: types.integer },

    buffers: {
      kind: "1:m",
      entity: () => BufferEntity,
      mappedBy: (buffer) => buffer.session,
    },
  },
});
export default {
  type: "session",
  schema: SessionSchema,
  entity: SessionEntity,
};
