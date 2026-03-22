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
