import { v } from "../lib.js";

export const IntentDescriptor = {
  $id: "Intent",
  own: {
    slug: v.string().optional(),
    type: v.string().optional(),
    name: v.string().optional(),
    description: v.string().optional(),
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    mode: () => v.rel(v.mode()).optional(),
  },
  narrowable: ["trait"],
};
