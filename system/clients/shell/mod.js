import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { Vector, signature } from "@vivalence/vector";

import tools from "./tools/index.js";

import boot, { shutdown } from "./lifecycle/boot.js";
import trajectory from "./trajectories/index.js";
import call from "./lifecycle/call.js";
import run from "./lifecycle/run.js";

// // @CONSTRUCT
export const client = {
  process: null,
  tools,
  trajectory: new Vector([signature]),
};
await boot(client);
await registry.init(config.registry);

// // @POPULATE
await trajectory(client);
await call(client);

// // @RESOLVE
try {
  await run(client);
} catch (error) {
  console.error(error);
  shutdown();
}
