import { v } from "../v.js";

// Emitter output — the value `prototypes/pool.js` Yield produces (pool.drain())
// and the body of every /emit response. `condition` mirrors pool.js `Condition`;
// `buffers` are buffer entities; `error` is present only on ERROR. Open shape:
// the Yield factories spread extra `...meta`.
//
// Lazy: `buffers` leans on v.buffer(), which (with v.mode/v.rel) isn't wired
// until schematics/index finishes. Build on first call so module-eval order
// can't bite. `Condition` has no entity dependency, so it stays eager.
export const Condition = v.enum(["NOMINAL", "EXHAUSTED", "ERROR"]);

let schema;
export const Yield = () =>
  (schema ??= v.object(
    {
      condition: Condition,
      buffers: v.array(v.buffer()),
      error: v.unknown().optional(),
    },
    { additionalProperties: true },
  ));
