import { v } from "../v.js";

export const LiteralDescriptor = {
  $id: "Literal",
  own: {
    slug: v.string().optional(),
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
    symbol: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    symbols: () => v.array(v.symbol()).optional(),
  },
  narrowable: ["trait", "symbol"],
};
