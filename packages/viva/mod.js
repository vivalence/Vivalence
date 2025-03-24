// @lj you found ground zero. congrats
import config from "@vivalence/config";
import { colors } from "@cliffy/ansi/colors";

import { Trajectory, parsers } from "@vivalence/trajectory";

import boot from "./lib/boot.js";
import locals from "./locals/index.js";
import entities from "./lib/entities.js";
import trajectory from "./trajectories/index.js";
import run from "./lib/run.js";

const start = performance.now();

const ticker = (name) => (viva) => {
  console.log(colors.blue(`[PERF] init to [${name}] in [${performance.now() - start}ms]`));
  return viva;
};

(async (viva) =>
  await [
    ticker("init"),
    boot,
    locals,
    entities,
    trajectory,
    run,
    ticker("done"),
    // (viva) => viva.process.doShutdown(),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(viva)))({
  process: null,
  services: config.services,
  registry: {},
  locals: {},
  trajectory: new Trajectory([parsers.path]),
});

// registry.boot,
// repository.boot,
