import { Collection, EntitySchema, type Opt, type Rel } from "@mikro-orm/core";

import { BaseEntity, BaseSchema } from "@vivalence/typology/entities";
import { UserEntity, ModeEntity } from "@vivalence/typology/entities";
// import { UserEntity } from "../view/User.ts";

import { SymbolEntity } from "../kernel/Symbol.ts";
import { LiteralEntity } from "../kernel/Literal.ts";
import { MemoryEntity } from "../userspace/Memory.ts";
import { ProductEntity } from "../userspace/Product.ts";

export class PlayEntity extends BaseEntity {
  user!: Rel<UserEntity>;

  literal?: Rel<LiteralEntity>;
  symbol?: Rel<SymbolEntity>;

  product!: Rel<ProductEntity>;
  mode!: Rel<ModeEntity>;

  memory!: Rel<MemoryEntity>;

  signal: any & Opt = {};
  // debrief?: any & Opt = {};
  nextIn!: number & Opt;
  nextAt!: Date & Opt;
}

export const PlaySchema = new EntitySchema<PlayEntity, BaseEntity>({
  class: PlayEntity,
  extends: BaseSchema,
  tableName: "Play",
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
      nullable: true,
    },
    symbol: {
      kind: "m:1",
      entity: () => SymbolEntity,
      fieldName: "symbol",
      updateRule: "cascade",
      deleteRule: "cascade",
      nullable: true,
    },

    product: {
      kind: "m:1",
      entity: () => ProductEntity,
      fieldName: "product",
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

    memory: {
      kind: "m:1",
      entity: () => MemoryEntity,
      fieldName: "memory",
    },

    signal: { type: "json" },
    // debrief: { type: "json", nullable: true },

    nextIn: { type: Number, defaultRaw: `0.0`, fieldName: "nextIn" },
    nextAt: { type: Date, fieldName: "nextAt" },
  },
});

export default {
  type: "play",
  schema: PlaySchema,
  entity: PlayEntity,
};
