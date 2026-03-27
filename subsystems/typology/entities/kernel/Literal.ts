import { EntityRepositoryType, Cascade, types, Collection, EntitySchema } from "@mikro-orm/core";
import { type Opt, type Rel } from "@mikro-orm/core";
import { EventSubscriber, type EventArgs } from "@mikro-orm/core";
import { object } from "@vivalence/typology";

import { DataEntity, DataSchema, DataRepository } from "../index.ts";
import { SymbolEntity } from "../index.ts";

export enum LiteralTraitsEnum {
  _ = "_",
}

export class LiteralRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug };
  }

  find(where, opts?) {
    return super.find(this.resolveSymbols(where), opts);
  }

  findOne(where, opts?) {
    return super.findOne(this.resolveSymbols(where), opts);
  }

  resolveSymbols(where) {
    if (!where?.symbols) return where;
    const { symbols, ...rest } = where;

    const spec = Array.isArray(symbols) ? { $all: symbols } : symbols;
    if (typeof spec !== "object" || (spec.$all == null && spec.$in == null && spec.$none == null))
      return { ...rest, symbols: spec };

    const { $all, $in, $none } = spec;
    const slug = (s) => typeof s === "string" ? { slug: s } : s;

    if ($all?.length)  rest.$and = [...(rest.$and || []), ...$all.map((s) => ({ symbols: slug(s) }))];
    if ($in?.length)   rest.symbols = { slug: { $in } };
    if ($none?.length) rest.symbols = { ...(rest.symbols || {}), $none: { slug: { $in: $none } } };

    return rest;
  }
}

export class LiteralEntity extends DataEntity {
  traits: LiteralTraitsEnum[] & Opt = [];
  slug: string & Opt = "";

  trait: any & Opt = {};
  symbol: Record<string, any> & Opt = {};

  symbols = new Collection<SymbolEntity>(this);
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
      defaultRaw: `'[]'`,
      type: types.json,
    },
    trait: { type: types.json },
    symbol: { type: types.json, defaultRaw: `'{}'` },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.literals,
      cascade: [Cascade.REMOVE],
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
