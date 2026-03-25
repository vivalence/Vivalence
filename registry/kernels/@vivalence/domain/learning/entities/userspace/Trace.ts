import { types, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/typology/entities";
import { UserEntity, ModeEntity, SessionEntity } from "@vivalence/typology/entities";

import { LiteralEntity } from "../kernel/Literal.ts";
import { MemoryEntity } from "./Memory.ts";

export class TraceEntity extends BaseEntity {
  user!: Rel<UserEntity>;
  literal!: Rel<LiteralEntity>;
  memory!: Rel<MemoryEntity>;
  mode?: Rel<ModeEntity>;
  session?: Rel<SessionEntity>;

  signal: any & Opt = {};
  status!: string & Opt;
  snapshot: any & Opt = {};
}

export const TraceSchema = new EntitySchema<TraceEntity, BaseEntity>({
  class: TraceEntity,
  extends: BaseSchema,
  tableName: "Trace",
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
    session: {
      kind: "m:1",
      entity: () => SessionEntity,
      fieldName: "session",
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
