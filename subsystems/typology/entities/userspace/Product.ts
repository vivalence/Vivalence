import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "../index.ts";
import { ModeEntity, IntentEntity, SessionEntity } from "../index.ts";
import { SymbolEntity, LiteralEntity } from "../index.ts";

export enum ProductStatusEnum {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  DONE = "DONE",
  ERROR = "ERROR",
  STALE = "STALE",
}

export enum ProductTypeEnum {
  MODAL = "MODAL",
  MESSAGE = "MESSAGE",
  SIGNAL = "SIGNAL",
}

// {type: "MODAL", traits: ["STATE"], data: {STATE: { front: { header: "gato" }, back: { header: "cat" } },}}
// {type: "MESSAGE", traits: ["AGENT", "THINKING"], data: {AGENT: { content: "here are some conjugations" }, THINKING: { reasoning: "user wants verb practice" }}}

// export enum ProductSignalEnum {}

export class ProductEntity extends BaseEntity {
  type: ProductTypeEnum & Opt = ProductTypeEnum.MODAL;
  status: ProductStatusEnum & Opt = ProductStatusEnum.PENDING;

  data: any & Opt = {};
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
    type: {
      enum: true,
      items: () => ProductTypeEnum,
      default: ProductTypeEnum.MODAL,
    },
    status: {
      enum: true,
      items: () => ProductStatusEnum,
      default: ProductStatusEnum.PENDING,
    },
    position: { type: Number },
    data: { type: "json" },

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
  schema: ProductSchema,
  entity: ProductEntity,
  // repository: TopographyRepository,
};
