import paladin from "@vivalence/paladin";
import { Vector } from "@vivalence/vector";
import gaia from "@vivalence/gaia";

import boot, { shutdown } from "./lifecycle/boot.js";
import trajectory from "./trajectories/index.js";
import call from "./lifecycle/call.js";
import run from "./lifecycle/run.js";
// import tools from "./tools/index.js";

// // @CONSTRUCT
// ghost is a special type of mode. variant.mode=ghost

const signal = new Signal(Deno.args);

export const client = {
  process: null,
  trajectory: null,
};
await boot(client);

// await registry.init(paladin.registry);

// // @POPULATE
await trajectory(client);
await call(client);

// // @RESOLVE
try {
  let i = 0;
  while (true && i++ < 25) await run(client);
  // keep alive
} catch (error) {
  console.error("[viva shell ERROR]");
  console.error(error);
  // shutdown("VIVA_SHUTDOWN");
}
