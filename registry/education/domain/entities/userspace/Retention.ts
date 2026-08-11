import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { DataEntity, DataSchema } from "@vivalence/runtime";
import { UserEntity } from "@vivalence/runtime";

import { LiteralEntity } from "../kernel/Literal.ts";
import { TraceEntity } from "./Trace.ts";
import { drivers } from "../../retention/index.js";

export enum RetentionDriverEnum {
  BAYESIAN = "BAYESIAN",
  BOOLEAN = "BOOLEAN",
  COUNTER = "COUNTER",
}

export enum RetentionTypeEnum {
  INDIVIDUAL = "INDIVIDUAL",
  //   RELATIONAL = "RELATIONAL",
}

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

  driver: RetentionDriverEnum & Opt = RetentionDriverEnum.BAYESIAN;
  status: RetentionStatusEnum & Opt = RetentionStatusEnum.UNKNOWN;
  type: RetentionTypeEnum & Opt = RetentionTypeEnum.INDIVIDUAL;

  state: any & Opt = {};
  lastSignal!: string & Opt;
  strength!: number & Opt;
  nextIn!: number & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;

  get is() {
    return {
      virgin: !this.status || this.status === "UNTOUCHED",
      weak: this.status === "UNKNOWN" || this.status === "LEARNING",
      familiar: this.status === "LEARNING" || this.status === "KNOWN",
      strong: this.status === "KNOWN" || this.status === "GRADUATED",
      succeeded: this.lastSignal === "SUCCESS" || this.lastSignal === "MASTERY",
      failed: this.lastSignal === "FAILURE" || this.lastSignal === "MISTAKE",
    };
  }

  evolve(signal, driver) {
    if (typeof signal === "string") signal = { enum: signal };

    const result = this.state ? driver.evolve(signal, this) : driver.encode(signal);

    this.state = result.state;
    this.status = result.status;
    this.nextIn = result.nextIn;
    this.nextAt = new Date(result.nextAt);
    this.lastAt = new Date();

    return { ...result, lastAt: this.lastAt, signal };
  }
}

export const RetentionSchema = new EntitySchema<RetentionEntity, DataEntity>({
  class: RetentionEntity,
  extends: DataSchema,
  uniques: [{ properties: ["user", "literal"] }],
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
    driver: {
      enum: true,
      items: () => RetentionDriverEnum,
      defaultRaw: `'${RetentionDriverEnum.BAYESIAN}'`,
      onCreate: () => RetentionDriverEnum.BAYESIAN,
    },
    type: {
      enum: true,
      items: () => RetentionTypeEnum,
      defaultRaw: `'${RetentionTypeEnum.INDIVIDUAL}'`,
      onCreate: () => RetentionTypeEnum.INDIVIDUAL,
    },
    status: {
      enum: true,
      items: () => RetentionStatusEnum,
      defaultRaw: `'${RetentionStatusEnum.UNKNOWN}'`,
      onCreate: () => RetentionStatusEnum.UNKNOWN,
    },

    state: { type: types.json },

    lastSignal: {
      type: types.string,
      formula: (table) =>
        `(SELECT json_extract(t.signal, '$.enum') FROM Trace t WHERE t.retention = ${table}.id ORDER BY t.created_at DESC LIMIT 1)`,
      persist: false,
      nullable: true,
    },

    strength: {
      type: types.float,
      formula: (table) => {
        const cases = Object.values(drivers)
          .filter((d) => d.sql?.strength)
          .map((d) => `WHEN '${d.type}' THEN ${d.sql.strength(table)}`)
          .join(" ");
        return `CASE ${table}.driver ${cases} ELSE 0.0 END`;
      },
      persist: false,
      lazy: true,
      nullable: true,
    },

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
