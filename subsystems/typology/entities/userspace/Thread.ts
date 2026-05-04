import { EntitySchema, Collection, types, type Opt, type Rel } from "@mikro-orm/core";

// import * as object from "../../gestalten/belt/object.js";
import { object } from "@vivalence/typology";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { UserEntity } from "../index.ts";
import { ModeEntity } from "../index.ts";
import { IntentEntity } from "../index.ts";
import { BufferEntity } from "../index.ts";
import { TurnEntity } from "../index.ts";

export enum ThreadPhaseEnum {
  STREAM = "stream",
}

export enum ThreadTraitsEnum {
  MASKED = "MASKED", // emitter input
  AIMED = "AIMED", // pointing at emitter
  QUEUEING = "QUEUEING", // pre-pulling buffers
  SELFEVIDENT = "SELFEVIDENT", // access mode buffer without daemon-roundtrip.
  LABELED = "LABELED", // UI display name
  CONVERSATIONAL = "CONVERSATIONAL", //
}

export class ThreadEntity extends DataEntity {
  // hash 24char: f(id)
  user!: Rel<UserEntity>;
  mode!: Rel<ModeEntity>;

  phase: ThreadPhaseEnum & Opt = ThreadPhaseEnum.STREAM;
  traits: ThreadTraitsEnum[] & Opt = [];
  trait: any & Opt = {};

  buffers = new Collection<BufferEntity>(this);
  turns = new Collection<TurnEntity>(this);

  counter: number & Opt = 0; // these two might be candidates for a trait?!
  cursor: number & Opt = 0; // these two might be candidates for a trait?!

  // mount?: string & Opt = ""; // also trait MOUNTED

  intent?: Rel<IntentEntity>;
}

export const ThreadSchema = new EntitySchema<ThreadEntity, DataEntity>({
  class: ThreadEntity,
  extends: DataSchema,
  tableName: "Thread",
  repository: () => DataRepository,
  filters: {
    user: {
      cond: (args: any) => ({ user: args.user }),
      default: true,
    },
  },
  hooks: {
    beforeCreate: [
      async (args: any) => {
        const thread = args.entity;
        if (!thread.intent) return;
        const intent =
          typeof thread.intent === "object" && thread.intent.traits
            ? thread.intent
            : await args.em.findOne(IntentEntity, thread.intent);
        if (!intent?.traits) return;
        thread.traits = [...intent.traits];
        thread.trait = object.merge(intent.trait, thread.trait);

        // labeled trait
      },
    ],
  },
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

    phase: {
      type: types.string,
      defaultRaw: `'${ThreadPhaseEnum.STREAM}'`,
      enum: true,
      items: () => ThreadPhaseEnum,
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

    turns: {
      kind: "1:m",
      entity: () => TurnEntity,
      mappedBy: (turn) => turn.thread,
    },
  },
});

export default {
  type: "thread",
  schema: ThreadSchema,
  entity: ThreadEntity,
};
