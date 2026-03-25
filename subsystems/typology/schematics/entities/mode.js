import { v } from "../lib.js";

export const ModeDescriptor = {
  $id: "Mode",
  own: {
    slug: v.string().optional(),
    type: v.string().optional(),
    name: v.string().optional(),
    description: v.string().optional(),
    version: v.string().optional(),
    installed: v.boolean().optional(),
    traits: v.array(v.string()).optional(),
  },
  relations: {
    intents: () => v.array(v.intent()).optional(),
    buffers: () => v.array(v.buffer()).optional(),
  },
  narrowable: ["traits"],
};
