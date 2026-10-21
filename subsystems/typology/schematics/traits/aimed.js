import { v } from "../v.js";

export const Aimed = v.object({
  mount: v.string().desc('The emitter\'s route a thread pulls its buffers from. Example: "/emitter/drill"'),
});
