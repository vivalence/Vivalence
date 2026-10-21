import { v } from "../v.js";

export const Queueing = v.object({
  depth: v.integer({ minimum: 1 }).default(1).desc("How many buffers the thread keeps queued. Example: 1"),
});
