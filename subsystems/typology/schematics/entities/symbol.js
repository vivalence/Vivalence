import { v } from "../lib.js";

export const SymbolDescriptor = {
  $id: "Symbol",
  own: {
    slug: v.string().optional(),
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    literals: () => v.array(v.literal()).optional(),
  },
  narrowable: ["trait"],
};
