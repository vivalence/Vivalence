import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { DataEntity, DataSchema } from "@vivalence/typology/entities";
import { UserEntity, ModeEntity, ThreadEntity } from "@vivalence/typology/entities";

import { LiteralEntity } from "../kernel/Literal.ts";
import { MemoryEntity } from "./Memory.ts";

export class TraceEntity extends DataEntity {
  user!: Rel<UserEntity>;
  literal!: Rel<LiteralEntity>;
  memory!: Rel<MemoryEntity>;
  mode?: Rel<ModeEntity>;
  thread?: Rel<ThreadEntity>;

  signal: any & Opt = {};
  status!: string & Opt;
  snapshot: any & Opt = {};
}

export const TraceSchema = new EntitySchema<TraceEntity, DataEntity>({
  class: TraceEntity,
  extends: DataSchema,
  tableName: "Trace",
  filters: {
    user: {
      cond: (args: any) => ({ user: args.user }),
      default: true,
    },
  },
  properties: {
    user: {
      kind: "m:1",
      entity: () => UserEntity,
      fieldName: "user",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    literal: {
      kind: "m:1",
      entity: () => LiteralEntity,
      fieldName: "literal",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    memory: {
      kind: "m:1",
      entity: () => MemoryEntity,
      fieldName: "memory",
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      nullable: true,
    },
    thread: {
      kind: "m:1",
      entity: () => ThreadEntity,
      fieldName: "thread",
      nullable: true,
    },

    signal: { type: types.json },
    status: { type: types.string },
    snapshot: { type: types.json },
  },
});

export default {
  type: "trace",
  schema: TraceSchema,
  entity: TraceEntity,
};
