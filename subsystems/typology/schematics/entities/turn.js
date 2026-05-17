import { v } from "../v.js";

export const TurnDescriptor = {
  $id: "Turn",
  own: {
    role: v.string(),
    parts: v.array(v.record(v.string(), v.unknown())).default([]).optional(),
    meta: v.record(v.string(), v.unknown()).optional(),
  },
  relations: {
    parent: () => v.rel(v.turn()).optional(),
    children: () => v.array(v.turn()).optional(),
    thread: () => v.rel(v.thread()),
    mode: () => v.rel(v.mode()),
  },
};
