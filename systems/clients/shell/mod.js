import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { Vector } from "@vivalence/vector";

import tools from "./tools/index.js";

import boot, { shutdown } from "./lifecycle/boot.js";
import trajectory from "./trajectories/index.js";
import call from "./lifecycle/call.js";
import run from "./lifecycle/run.js";

// // @CONSTRUCT
export const client = {
  process: null,
  tools,
  trajectory: new Vector(),
};
await boot(client);
await registry.init(config.registry);

// // @POPULATE
await trajectory(client);
await call(client);

// // @RESOLVE
try {
  let i = 0;
  while (true && i++ < 25) await run(client);
} catch (error) {
  console.error(error);
  shutdown("VIVA_SHUTDOWN");
}
