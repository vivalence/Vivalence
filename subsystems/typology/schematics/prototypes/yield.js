import { v } from "../v.js";

// Emitter output — the value `prototypes/pool.js` Yield produces (pool.drain())
// and the body of every /emit response. `condition` mirrors pool.js `Condition`;
// `output` is the ONE payload bag — keys are payload words (message, object) or
// entity type names keyed singular (only `buffer` today); `error` is present
// only on ERROR. Open shape: the Yield factories spread extra `...meta`.
//
// Lazy: `output.buffer` leans on v.buffer(), which (with v.mode/v.rel) isn't
// wired until schematics/index finishes. Build on first call so module-eval
// order can't bite. `Condition` has no entity dependency, so it stays eager.
export const Condition = v.enum(["NOMINAL", "EXHAUSTED", "ERROR"]);

let schema;
export const Yield = () =>
  (schema ??= v.object(
    {
      condition: Condition,
      output: v.object({ buffer: v.array(v.buffer()) }, { additionalProperties: true }),
      error: v.unknown().optional(),
    },
    { additionalProperties: true },
  ));
