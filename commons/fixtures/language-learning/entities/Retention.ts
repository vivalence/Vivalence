import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";
import { DataEntity, DataSchema, LiteralEntity, UserEntity } from "@vivalence/runtime";
import { TraceEntity } from "./Trace.ts";

// the fixture package's OWN review-memory entity. deliberately data-shaped: no drivers, no
// `evolve`, and `lastSignal`/`strength` are plain columns rather than SQL formulas — the runtime
// suite seeds and reads these rows, it never exercises retention behaviour. @testing is standalone.
export enum RetentionStatusEnum {
  UNTOUCHED = "UNTOUCHED",
  UNKNOWN = "UNKNOWN",
  LEARNING = "LEARNING",
  KNOWN = "KNOWN",
  GRADUATED = "GRADUATED",
}

export class RetentionEntity extends DataEntity {
  user!: Rel<UserEntity>;
  literal!: Rel<LiteralEntity>;
  traces = new Collection<TraceEntity>(this);

  status: RetentionStatusEnum & Opt = RetentionStatusEnum.UNKNOWN;
  state: any & Opt = {};
  lastSignal!: string & Opt;
  nextIn!: number & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;
}

export const RetentionSchema = new EntitySchema<RetentionEntity, DataEntity>({
  class: RetentionEntity,
  extends: DataSchema,
  tableName: "Retention",
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
    traces: {
      kind: "1:m",
      entity: () => TraceEntity,
      mappedBy: (trace) => trace.retention,
    },
    status: {
      enum: true,
      items: () => RetentionStatusEnum,
      defaultRaw: `'${RetentionStatusEnum.UNKNOWN}'`,
      onCreate: () => RetentionStatusEnum.UNKNOWN,
    },
    state: { type: types.json },
    lastSignal: { type: types.string, nullable: true },
    nextIn: { type: types.integer, defaultRaw: `0.0`, fieldName: "nextIn" },
    nextAt: { type: Date, fieldName: "nextAt" },
    lastAt: { type: Date, fieldName: "lastAt" },
  },
});

export default {
  type: "retention",
  schema: RetentionSchema,
  entity: RetentionEntity,
};
