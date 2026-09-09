import { EntitySchema, types } from "@mikro-orm/core";

import {
  BufferEntity,
  LiteralEntity,
  LiteralRepository,
  LiteralSchema,
  SymbolEntity,
  TurnEntity,
} from "@vivalence/runtime";

import { BufferConcrete, SymbolConcrete } from "@vivalence/runtime/scenarios";

export enum LiteralTraits {
  TRANSLATED = "TRANSLATED",
  ANNOTATED = "ANNOTATED",
  VOCALIZED = "VOCALIZED",
}

class TestLiteralRepository extends LiteralRepository {
  async feed(where: any, opts?: any) {
    const { limit, blacklist, populate } = opts || {};
    const filters: any = { ...where };
    if (blacklist?.literals?.length) {
      filters.id = {
        $nin: blacklist.literals.map((literal: any) => literal?.id ?? literal),
      };
    }
    return this.find(filters, { limit, populate });
  }
}

export const LiteralDomain = new EntitySchema({
  class: LiteralEntity,
  extends: LiteralSchema,
  tableName: "Literal",
  name: "Literal",
  repository: () => TestLiteralRepository,
  properties: {
    traits: {
      items: () => LiteralTraits,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },
  },
});

export { BufferConcrete as BufferDomain, SymbolConcrete as SymbolDomain };
export { BufferEntity, LiteralEntity, SymbolEntity, TurnEntity };
