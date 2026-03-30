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

  resolveSymbols(query) {
    if (!query?.symbols) return query;
    const { symbols, ...where } = query;

    const spec = Array.isArray(symbols) ? { $all: symbols } : symbols;
    if (typeof spec !== "object" || (spec.$all == null && spec.$in == null && spec.$none == null))
      return { ...where, symbols: spec };

    const { $all, $in, $none } = spec;
    const slug = (s) => (typeof s === "string" ? { slug: s } : s);

    if ($all?.length)
      where.$and = [...(where.$and || []), ...$all.map((s) => ({ symbols: slug(s) }))];
    if ($in?.length) where.symbols = { slug: { $in } };
    if ($none?.length)
      where.symbols = { ...(where.symbols || {}), $none: { slug: { $in: $none } } };

    return where;
  }
}

export class LiteralEntity extends DataEntity {
  traits: LiteralTraitsEnum[] & Opt = [];
  slug: string & Opt = "";

  trait: any & Opt = {};
  symbol: Record<string, any> & Opt = {};
  ontology: string & Opt = "";

  symbols = new Collection<SymbolEntity>(this);
  uses = new Collection<LiteralEntity>(this);
  in = new Collection<LiteralEntity>(this);
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
    ontology: { type: types.string, default: "" },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.literals,
      cascade: [Cascade.REMOVE],
    },
    uses: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: "in",
    },
    in: {
      kind: "m:n",
      entity: () => LiteralEntity,
      mappedBy: "uses",
    },
  },
});

export class LiteralSubscriber implements EventSubscriber<LiteralEntity> {
  getSubscribedEntities() {
    return [LiteralEntity];
  }

  symbol(entity: LiteralEntity) {
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

  ontology(entity: LiteralEntity): string {
    if (!entity.symbols.isInitialized()) return entity.ontology;
    const topographical = entity.symbols
      .getItems()
      .filter((s) => s.traits.includes("TOPOGRAPHICAL" as any));
    if (topographical.length === 0) return;
    if (topographical.length > 1)
      throw new Error(
        `Literal "${entity.slug}" must have exactly one TOPOGRAPHICAL symbol, found ${topographical.length}`,
      );
    return topographical[0].slug;
  }

  beforeCreate({ entity }: EventArgs<LiteralEntity>) {
    entity.symbol = this.symbol(entity);
    entity.ontology = this.ontology(entity);
  }
  beforeUpdate({ entity }: EventArgs<LiteralEntity>) {
    entity.symbol = this.symbol(entity);
    entity.ontology = this.ontology(entity);
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
