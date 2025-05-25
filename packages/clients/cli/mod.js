import { colors } from "@cliffy/ansi/colors";

import { Trajectory, parsers } from "@vivalence/shared/trajectory";

import boot from "./lib/boot.js";
import locals from "./locals/index.js";
import trajectory from "./trajectories/index.js";
import run from "./lib/run.js";

// import config from "@vivalence/config";
// import Repository from "@vivalence/repository";
// import entities from "./lib/entities.js";

const start = performance.now();

const ticker = (name) => (viva) => {
  console.log(
    colors.blue(`[PERF] init to [${name}] in [${performance.now() - start}ms]`),
  );
  return viva;
};

(async (viva) =>
  await [
    ticker("init"),
    boot,
    locals,
    trajectory,
    run,
    ticker("done"),
    // (viva) => viva.process.doShutdown(),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(viva)))({
  process: null,
  locals: {},
  trajectory: new Trajectory([parsers.sig]),
  // services: await Repository.services.load(),
  // runtimes: await Repository.runtimes.load(),
  // registry: {},
});
