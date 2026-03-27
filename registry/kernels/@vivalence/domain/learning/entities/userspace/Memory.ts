import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { DataEntity, DataSchema } from "@vivalence/typology/entities";
import { UserEntity } from "@vivalence/typology/entities";

import { LiteralEntity } from "../kernel/Literal.ts";
import { TraceEntity } from "./Trace.ts";
import { drivers } from "../../memory/index.js";

export enum MemoryDriverEnum {
  BAYESIAN = "BAYESIAN",
  BOOLEAN = "BOOLEAN",
  COUNTER = "COUNTER",
}

export enum MemoryTypeEnum {
  INDIVIDUAL = "INDIVIDUAL",
  //   RELATIONAL = "RELATIONAL",
}

export enum MemoryStatusEnum {
  UNTOUCHED = "UNTOUCHED",
  UNKNOWN = "UNKNOWN",
  LEARNING = "LEARNING",
  KNOWN = "KNOWN",
  GRADUATED = "GRADUATED",
}

export class MemoryEntity extends DataEntity {
  user!: Rel<UserEntity>;
  literal!: Rel<LiteralEntity>;
  traces = new Collection<TraceEntity>(this);

  driver: MemoryDriverEnum & Opt = MemoryDriverEnum.BAYESIAN;
  status: MemoryStatusEnum & Opt = MemoryStatusEnum.UNKNOWN;
  type: MemoryTypeEnum & Opt = MemoryTypeEnum.INDIVIDUAL;

  state: any & Opt = {};
  lastSignal!: string & Opt;
  strength!: number & Opt;
  nextIn!: number & Opt;
  nextAt!: Date & Opt;
  lastAt!: Date & Opt;

  evolve(signal, driver) {
    if (typeof signal === "string") signal = { enum: signal };

    const result = this.state
      ? driver.evolve(signal, this)
      : driver.encode(signal);

    this.state = result.state;
    this.status = result.status;
    this.nextIn = result.nextIn;
    this.nextAt = new Date(result.nextAt);
    this.lastAt = new Date();

    return { ...result, lastAt: this.lastAt, signal };
  }
}

export const MemorySchema = new EntitySchema<MemoryEntity, DataEntity>({
  class: MemoryEntity,
  extends: DataSchema,
  uniques: [{ properties: ["user", "literal"] }],
  tableName: "Memory",
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
      mappedBy: (trace) => trace.memory,
    },
    driver: {
      enum: true,
      items: () => MemoryDriverEnum,
      defaultRaw: `'${MemoryDriverEnum.BAYESIAN}'`,
      onCreate: () => MemoryDriverEnum.BAYESIAN,
    },
    type: {
      enum: true,
      items: () => MemoryTypeEnum,
      defaultRaw: `'${MemoryTypeEnum.INDIVIDUAL}'`,
      onCreate: () => MemoryTypeEnum.INDIVIDUAL,
    },
    status: {
      enum: true,
      items: () => MemoryStatusEnum,
      defaultRaw: `'${MemoryStatusEnum.UNKNOWN}'`,
      onCreate: () => MemoryStatusEnum.UNKNOWN,
    },

    state: { type: types.json },

    lastSignal: {
      type: types.string,
      formula: (table) => `(SELECT json_extract(t.signal, '$.enum') FROM Trace t WHERE t.memory = ${table}.id ORDER BY t.created_at DESC LIMIT 1)`,
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
  type: "memory",
  schema: MemorySchema,
  entity: MemoryEntity,
};
