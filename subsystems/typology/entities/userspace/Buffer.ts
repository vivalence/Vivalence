import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../index.ts";
import { SymbolEntity, LiteralEntity } from "../index.ts";
// import { ModeEntity, SessionEntity } from "../index.ts";

// export enum BufferTypeEnum {MODAL = "MODAL", MESSAGE = "MESSAGE", SIGNAL = "SIGNAL",}
// export enum BufferTraitsEnum {BUFFERED = "BUFFERED", SIGNAL = "SIGNAL",}
// export enum BufferStatusEnum {PENDING = "PENDING", ACTIVE = "ACTIVE", DONE = "DONE", ERROR = "ERROR", STALE = "STALE",}

export class BufferEntity extends BaseEntity {
  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);

  // traits: BufferTraitsEnum[] & Opt = [];
  // data: any & Opt = {};

  // status: BufferStatusEnum & Opt = BufferStatusEnum.PENDING;
  // position: number & Opt = 0;
  // producer!: Rel<ModeEntity>;
  // commissioner!: Rel<ModeEntity>;
}

export const BufferSchema = new EntitySchema<BufferEntity, BaseEntity>({
  extends: BaseSchema,
  name: "Buffer",
  tableName: "Buffer",
  abstract: true,
  properties: {
    parent: {
      kind: "m:1",
      entity: () => BufferEntity,
      inversedBy: (buffer) => buffer.children,
      nullable: true,
    },
    children: {
      kind: "1:m",
      entity: () => BufferEntity,
      mappedBy: (buffer) => buffer.parent,
    },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.buffers,
    },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      mappedBy: (literal) => literal.buffers,
    },

    // type: {enum: true, items: () => BufferTypeEnum, default: BufferTypeEnum.MODAL,},
    // traits: {items: () => BufferTraitsEnum, enum: true, array: true, defaultRaw: `'[]'`, type: types.json,},
    // data: { type: types.json },
    // status: {enum: true, items: () => BufferStatusEnum, defaultRaw: `'${BufferStatusEnum.PENDING}'`,},
    // position: { type: types.integer },
    // session: {kind: "m:1", entity: () => SessionEntity, fieldName: "session",},
    // producer: {kind: "m:1", entity: () => ModeEntity, fieldName: "producer",},
    // commissioner: {kind: "m:1", entity: () => ModeEntity, fieldName: "commissioner",},
    // intent: {kind: "m:1", entity: () => IntentEntity, fieldName: "intent", nullable: true,},
  },
});

export default {
  type: "buffer",
  traits: BufferTraitsEnum,
  schema: BufferSchema,
  entity: BufferEntity,
  // repository: TopographyRepository,
};
