export { Entity } from "./entity.js";
export { Mode } from "./mode.js";
export { Intent } from "./intent.js";
export { Thread } from "./thread.js";
export { Buffer } from "./buffer.js";

import { Mode } from "./mode.js";
import { Intent } from "./intent.js";
import { Thread } from "./thread.js";
import { Buffer } from "./buffer.js";

// Registry: maps entity names (as returned by strip()) to classes.
// Dataspace uses this to construct typed repositories dynamically.
export const registry = {
  mode: Mode,
  intent: Intent,
  thread: Thread,
  buffer: Buffer,
};
