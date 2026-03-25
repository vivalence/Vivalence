import { v } from "../lib.js";

export const SessionDescriptor = {
  $id: "Session",
  own: {
    traits: v.array(v.string()).optional(),
    trait: v.record(v.string(), v.unknown()).optional(),
    cursor: v.integer().default(0).optional(),
    counter: v.integer().default(0).optional(),
  },
  relations: {
    user: () => v.rel(v.user()).optional(),
    mode: () => v.rel(v.mode()).optional(),
    intent: () => v.rel(v.intent()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
  },
  narrowable: ["trait"],
};
