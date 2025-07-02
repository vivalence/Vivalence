import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { Trajectory, parsers } from "@vivalence/shared/trajectory";

import boot from "./lib/boot.js";
import tools from "./locals/index.js";
import trajectory from "./trajectories/index.js";
import run from "./lib/run.js";

const client = {
  process: null,
  tools: {},
  trajectory: new Trajectory([parsers.sig]),
};

await registry.init();

await [
  boot,
  tools,
  trajectory,
  run,
  // (client) => client.process.doShutdown(),
].reduce((acc, fn) => acc.then(fn), Promise.resolve(client));
