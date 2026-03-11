import { EntityRepositoryType, Cascade, types, Collection, EntitySchema } from "@mikro-orm/core";
import { type Opt, type Rel } from "@mikro-orm/core";
import { EventSubscriber, type EventArgs } from "@mikro-orm/core";
import { object } from "@vivalence/typology";

import { DataEntity, DataSchema, DataRepository } from "../index.ts";
import { ProductEntity, SymbolEntity } from "../index.ts";

export enum LiteralTraitsEnum {}

export class LiteralRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug };
  }
}

export class LiteralEntity extends DataEntity {
  traits: LiteralTraitsEnum[] & Opt = [];
  slug: string & Opt = "";

  data: any & Opt = {};
  symbol: Record<string, any> & Opt = {};

  symbols = new Collection<SymbolEntity>(this);
  products = new Collection<ProductEntity>(this);
  [EntityRepositoryType]?: LiteralRepository;
}

export const LiteralSchema = new EntitySchema({
  extends: DataSchema,
  abstract: true,
  tableName: "Literal",
  name: "Literal",
  uniques: [{ properties: ["slug"] }],
  repository: () => LiteralRepository,
  properties: {
    slug: { type: types.string },
    traits: {
      items: () => LiteralTraitsEnum,
      enum: true,
      array: true,
      default: [],
      type: types.json,
    },
    data: { type: "json" },
    symbol: { type: "json", default: {} },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.literals,
      cascade: [Cascade.REMOVE],
    },
    products: {
      kind: "m:n",
      entity: () => ProductEntity,
      inversedBy: (product) => product.literals,
    },
  },
});

function computeSymbol(entity: LiteralEntity) {
  if (!entity.symbols.isInitialized()) return entity.symbol;

  const result = {};
  const symbols = [...entity.symbols.getItems()].sort(
    (a, b) => a.slug.split(".").length - b.slug.split(".").length,
  );

  for (const symbol of symbols) {
    object.set(result, symbol.slug);
  }

  return result;
}

export class LiteralSubscriber implements EventSubscriber<LiteralEntity> {
  getSubscribedEntities() {
    return [LiteralEntity];
  }
  beforeCreate({ entity }: EventArgs<LiteralEntity>) {
    entity.symbol = computeSymbol(entity);
  }
  beforeUpdate({ entity }: EventArgs<LiteralEntity>) {
    entity.symbol = computeSymbol(entity);
  }
}

export default {
  type: "literal",
  traits: LiteralTraitsEnum,
  schema: LiteralSchema,
  entity: LiteralEntity,
  repository: LiteralRepository,
  subscriber: LiteralSubscriber,
};
