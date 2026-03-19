import { types, EntitySchema, type Opt } from "@mikro-orm/core";
import {
  LiteralEntity, LiteralSchema,
  SymbolEntity, SymbolSchema,
  ProductEntity, ProductSchema,
  ModeSchema, ValenceSchema,
  UserSchema, SessionSchema,
} from "@vivalence/typology/entities";

export enum LiteralTraits {
  TRANSLATED = "TRANSLATED",
}

export const LiteralDomain = new EntitySchema({
  class: LiteralEntity,
  extends: LiteralSchema,
  tableName: "Literal",
  name: "Literal",
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

export const SymbolDomain = new EntitySchema({
  class: SymbolEntity,
  extends: SymbolSchema,
  tableName: "Symbol",
  name: "Symbol",
});

export const ProductDomain = new EntitySchema({
  class: ProductEntity,
  extends: ProductSchema,
  tableName: "Product",
  name: "Product",
});

export const schemas = [
  LiteralDomain,
  SymbolDomain,
  ProductDomain,
  ModeSchema, ValenceSchema,
  UserSchema, SessionSchema,
];

export { LiteralEntity, SymbolEntity, ProductEntity };
