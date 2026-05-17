import { v } from "../v.js";

export const BufferDescriptor = {
  $id: "Buffer",
  own: {
    index: v.integer().default(0).optional(),
    data: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    mode: () => v.rel(v.mode()).optional(),
    thread: () => v.rel(v.thread()).optional(),
    literals: () => v.array(v.literal()).optional(),
    symbols: () => v.array(v.symbol()).optional(),
  },
  narrowable: ["data"],
};
