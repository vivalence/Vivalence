import { types, Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../index.ts";
import { ModeEntity, SessionEntity } from "../index.ts";
import { SymbolEntity, LiteralEntity } from "../index.ts";

// export enum ProductTypeEnum {MODAL = "MODAL", MESSAGE = "MESSAGE", SIGNAL = "SIGNAL",}

export enum ProductTraitsEnum {
  BUFFERED = "BUFFERED",
  SIGNAL = "SIGNAL",
}

export enum ProductStatusEnum {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  DONE = "DONE",
  ERROR = "ERROR",
  STALE = "STALE",
}

export class ProductEntity extends BaseEntity {
  // type: ProductTypeEnum & Opt = ProductTypeEnum.MODAL;

  traits: ProductTraitsEnum[] & Opt = [];
  data: any & Opt = {};

  status: ProductStatusEnum & Opt = ProductStatusEnum.PENDING;
  position: number & Opt = 0;

  producer!: Rel<ModeEntity>;
  commissioner!: Rel<ModeEntity>;

  session!: Rel<SessionEntity>;
  // intent?: Rel<IntentEntity>;

  literals = new Collection<LiteralEntity>(this);
  symbols = new Collection<SymbolEntity>(this);
}

export const ProductSchema = new EntitySchema<ProductEntity, BaseEntity>({
  extends: BaseSchema,
  name: "Product",
  tableName: "Product",
  abstract: true,
  properties: {
    // type: {enum: true, items: () => ProductTypeEnum, default: ProductTypeEnum.MODAL,},

    traits: {
      items: () => ProductTraitsEnum,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },

    data: { type: types.json },

    status: {
      enum: true,
      items: () => ProductStatusEnum,
      defaultRaw: `'${ProductStatusEnum.PENDING}'`,
    },
    position: { type: types.integer },
    session: {
      kind: "m:1",
      entity: () => SessionEntity,
      fieldName: "session",
    },

    producer: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "producer",
    },

    commissioner: {
      kind: "m:1",
      entity: () => ModeEntity,
      fieldName: "commissioner",
    },

    // intent: {kind: "m:1", entity: () => IntentEntity, fieldName: "intent", nullable: true,},

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.products,
    },

    literals: {
      kind: "m:n",
      entity: () => LiteralEntity,
      mappedBy: (literal) => literal.products,
    },
  },
});

export default {
  type: "product",
  traits: ProductTraitsEnum,
  schema: ProductSchema,
  entity: ProductEntity,
  // repository: TopographyRepository,
};
