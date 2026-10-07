import { EntityRepositoryType, Cascade, types, Collection, EntitySchema } from "@mikro-orm/core";
import { type Opt, type Rel } from "@mikro-orm/core";
import { object, Vector } from "@vivalence/typology";

import { DataEntity, DataSchema, DataRepository } from "./index.ts";
import { SymbolEntity } from "./index.ts";
import { ModeEntity } from "./index.ts";
import { DaemonEntity } from "./index.ts";
import { NoteEntity } from "./index.ts";

// @beef: FILE trait on literal

export class LiteralRepository extends DataRepository {
  unique(opt) {
    return { slug: opt.slug };
  }

  find(where, opts?) {
    return super.find(this.resolveSearch(this.resolveSymbols(where)), opts);
  }

  findOne(where, opts?) {
    return super.findOne(this.resolveSymbols(where), opts);
  }

  resolveSearch(query) {
    if (!query?.search || !this.search) return query;
    const { search, ...where } = query;
    where.$or = this.search(query);
    return where;
  }

  resolveSymbols(query) {
    if (!query?.symbols) return query;
    const { symbols, ...where } = query;

    const spec = Array.isArray(symbols) ? { $all: symbols } : symbols;
    if (typeof spec !== "object" || (spec.$all == null && spec.$in == null && spec.$none == null))
      return { ...where, symbols: spec };

    const { $all, $in, $none } = spec;

    if ($all?.length)
      where.$and = [...(where.$and || []), ...$all.map((s) => ({ symbols: this.reference(s) }))];
    if ($in?.length) where.symbols = { slug: { $in } };
    if ($none?.length)
      where.symbols = { ...(where.symbols || {}), $none: { slug: { $in: $none } } };

    return where;
  }

  get extensions() {
    return {
      ...super.extensions,
      search: "text over slug + translations",
      symbols: "symbol slug array (AND per symbol) or { $all, $in, $none }",
    };
  }
}

export class LiteralEntity extends DataEntity {
  traits: string[] & Opt = [];
  slug: string & Opt = "";

  trait: any & Opt = {};
  symbol: Record<string, any> & Opt = {};
  ontology: string & Opt = "";

  symbols = new Collection<SymbolEntity>(this);
  daemon!: Rel<DaemonEntity>;
  mode!: Rel<ModeEntity>;
  uses = new Collection<LiteralEntity>(this);
  in = new Collection<LiteralEntity>(this);
  notes = new Collection<NoteEntity>(this);
  [EntityRepositoryType]?: LiteralRepository;
}

export const LiteralSchema = new EntitySchema({
  extends: DataSchema,
  class: LiteralEntity,
  tableName: "Literal",
  name: "Literal",
  uniques: [{ properties: ["daemon", "slug"] }],
  repository: () => LiteralRepository,
  filters: { daemon: { cond: (args: any) => ({ daemon: args.daemon }), default: false } },
  properties: {
    slug: { type: types.string },
    traits: { type: types.json, defaultRaw: `'[]'` },
    trait: { type: types.json },
    symbol: { type: types.json, defaultRaw: `'{}'` },
    ontology: { type: types.string, default: "" },
    daemon: {
      kind: "m:1",
      entity: () => DaemonEntity,
      inversedBy: (daemon) => daemon.literals,
      updateRule: "cascade",
      deleteRule: "cascade",
    },

    symbols: {
      kind: "m:n",
      entity: () => SymbolEntity,
      mappedBy: (symbol) => symbol.literals,
      cascade: [Cascade.REMOVE],
    },
    mode: {
      kind: "m:1",
      entity: () => ModeEntity,
      inversedBy: (mode) => mode.literals,
      updateRule: "cascade",
      deleteRule: "cascade",
    },
    uses: {
      kind: "m:n",
      entity: () => LiteralEntity,
      inversedBy: "in",
      pivotTable: "literal_uses",
      joinColumns: ["literal_entity_1_id"],
      inverseJoinColumns: ["literal_entity_2_id"],
    },
    in: {
      kind: "m:n",
      entity: () => LiteralEntity,
      mappedBy: "uses",
    },
    notes: { kind: "1:m", entity: () => NoteEntity, mappedBy: (note) => note.literal },
  },
});

const fold = {
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
  },

  ontology(entity: LiteralEntity): string {
    if (!entity.symbols.isInitialized()) return entity.ontology;
    const topographical = entity.symbols
      .getItems()
      .filter((s) => s.traits.includes("TOPOGRAPHICAL" as any));
    if (topographical.length === 0) return entity.ontology;
    if (topographical.length > 1)
      throw new Error(
        `Literal "${entity.slug}" must have exactly one TOPOGRAPHICAL symbol, found ${topographical.length}`,
      );
    return topographical[0].slug;
  },
};

const twitch = new Vector();
for (const op of ["create", "update"])
  twitch.open(`/before/literal/${op}`, (ctx) => {
    ctx.input.entity.symbol = fold.symbol(ctx.input.entity);
    ctx.input.entity.ontology = fold.ontology(ctx.input.entity);
  });

export default {
  type: "literal",
  schema: LiteralSchema,
  entity: LiteralEntity,
  repository: LiteralRepository,
  twitch,
};
