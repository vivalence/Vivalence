import { v } from "../v.js";
import { thread } from "../traits/index.js";

export const ThreadDescriptor = {
  $id: "Thread",
  own: {
    traits: v.array(v.enum(Object.keys(thread.properties))).optional(),
    trait: thread.default({}),
    cursor: v.integer().default(0).optional(),
    counter: v.integer().default(0).optional(),
  },
  relations: {
    user: () => v.rel(v.user()).optional(),
    mode: () => v.rel(v.mode()).optional(),
    intent: () => v.rel(v.intent()).optional(),
    parent: () => v.rel(v.thread()).optional(),
    children: () => v.array(v.thread()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
  },
  traits: thread,
  narrowable: ["trait"],
};
