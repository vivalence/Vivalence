import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { DataRepository, DataEntity, DataSchema } from "../index.ts";
import { ModeEntity } from "../index.ts";
import { ThreadEntity } from "../index.ts";
import { LiteralEntity } from "../index.ts";
import { SymbolEntity } from "../index.ts";

export enum BufferStatusEnum {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  DONE = "DONE",
  ERROR = "ERROR",
  STALE = "STALE",
}

export class BufferEntity extends DataEntity {
  status: BufferStatusEnum & Opt = BufferStatusEnum.PENDING;
  data: any & Opt = {};
  view: any & Opt = null;
  index: number & Opt = 0;

  mode!: Rel<ModeEntity>;
  thread?: Rel<ThreadEntity>;

  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);
}

export const BufferSchema = new EntitySchema<BufferEntity, DataEntity>({
  extends: DataSchema,
  name: "Buffer",
  tableName: "Buffer",
  repository: () => DataRepository,
  abstract: true,
  filters: {
    user: {
      cond: (args: any) => ({ thread: { user: args.user } }),
      default: true,
    },
  },
  properties: {
    status: {
      enum: true,
      items: () => BufferStatusEnum,
      defaultRaw: `'${BufferStatusEnum.PENDING}'`,
    },
    data: { type: types.json, defaultRaw: `'{}'` },
    view: { type: types.json, nullable: true },
    index: { type: types.integer, default: 0 },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    thread: {
      kind: "m:1",
      entity: () => ThreadEntity,
      fieldName: "thread",
      nullable: true,
    },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      owner: true,
    },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      owner: true,
    },
  },
});

export default {
  type: "buffer",
  schema: BufferSchema,
  entity: BufferEntity,
};
