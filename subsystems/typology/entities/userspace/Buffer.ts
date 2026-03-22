import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../index.ts";
import { ModeEntity } from "../index.ts";
import { SessionEntity } from "../index.ts";
import { LiteralEntity } from "../index.ts";
import { SymbolEntity } from "../index.ts";

export class BufferEntity extends BaseEntity {
  data: any & Opt = {};
  index: number & Opt = 0;

  mode!: Rel<ModeEntity>;
  session?: Rel<SessionEntity>;

  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);
}

export const BufferSchema = new EntitySchema<BufferEntity, BaseEntity>({
  extends: BaseSchema,
  name: "Buffer",
  tableName: "Buffer",
  abstract: true,
  properties: {
    data: { type: types.json, defaultRaw: `'{}'` },
    index: { type: types.integer, default: 0 },

    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "mode",
    },

    session: {
      kind: "m:1",
      entity: () => SessionEntity,
      fieldName: "session",
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

// export enum BufferStatusEnum {
//   PENDING = "PENDING",
//   ACTIVE = "ACTIVE",
//   DONE = "DONE",
//   ERROR = "ERROR",
//   STALE = "STALE",
// }
//
// export enum BufferTraitsEnum {
//   FURNISHED = "FURNISHED",
//   STATEFUL = "STATEFUL",
//   DIALOGIC = "DIALOGIC",
//   AGENTIC = "AGENTIC",
// }
//
// export class BufferEntity extends BaseEntity {
//   traits: BufferTraitsEnum[] & Opt = [];
//   trait: any & Opt = {};
//   status: BufferStatusEnum & Opt = BufferStatusEnum.PENDING;
//   index: number & Opt = 0;
//   mode!: Rel<ModeEntity>;
//   session!: Rel<SessionEntity>;
// }
