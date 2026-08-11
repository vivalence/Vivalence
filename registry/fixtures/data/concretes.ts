import { types, EntitySchema } from "@mikro-orm/core";

import {
  LiteralEntity,
  LiteralSchema,
  LiteralRepository,
  SymbolEntity,
  BufferEntity,
  TurnEntity,
} from "@vivalence/runtime";

import { SymbolConcrete, BufferConcrete } from "@vivalence/runtime/scenarios";

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
      filters.id = { $nin: blacklist.literals.map((literal: any) => literal?.id ?? literal) };
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

export { SymbolConcrete as SymbolDomain, BufferConcrete as BufferDomain };
export { LiteralEntity, SymbolEntity, BufferEntity, TurnEntity };
