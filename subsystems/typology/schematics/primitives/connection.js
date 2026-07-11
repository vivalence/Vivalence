import { v } from "../v.js";
import { ID } from "../scalars/index.js";
import { Signal } from "../prototypes/signatures.js";

const Verb = v.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).desc("method");
const Fault = v.object({ status: v.integer(), message: v.string() });

// client → server: open one frame. `signal` decodes to a Signal (routing);
// `query` carries the search string separately (Signal is path-only).
export const Open = v.object({
  frame: ID,
  signal: Signal(),
  query: v.string().optional(),
  verb: Verb.optional(),
  token: v.string().optional(), // opaque to transport; secure.authorize validates
  stream: v.boolean().optional(),
  input: v.unknown().optional(),
});

// the whole wire grammar as one discriminated union — the contract as data.
export const Packet = v.union([
  Open,
  v.object({ frame: ID, input: v.unknown() }), // upstream chunk
  v.object({ frame: ID, done: v.const(true) }), // upstream end
  v.object({ frame: ID, close: v.const(true) }), // cancel / end
  v.object({ frame: ID, open: v.const(true) }), // attach ACK
  v.object({ frame: ID, output: v.unknown() }), // reply / stream item
  v.object({ frame: ID, error: Fault }), // failure
  v.object({ signal: Signal(), input: v.unknown() }), // push (frame-less)
]);
