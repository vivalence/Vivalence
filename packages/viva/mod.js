// mod.js - Main module with boot sequence
import config from "@vivalence/config";

import { colors } from "@cliffy/ansi/colors";

// Core components
import { createTrajectory } from "./shared/trajectory/index.js";
// import { Walker } from "./lib/walker.js";
// import { Renderer } from "./renderer/cli.js";

import boot from "./lib/boot.js";
import captureProcess from "./lib/process.js";
import locals from "./locals/index.js";
import commands from "./commands/index.js";

const start = performance.now();

const ticker = (name) => (viva) => {
  console.log(colors.blue(`[PERF] init to [${name}] in [${performance.now() - start}ms]`));
  return viva;
};

// Initialize viva object
const viva = {
  process: null,
  services: config.services,
  registry: {},
  locals: {},
  trajectory: createTrajectory(),
};

const walk = async (viva) => {
  console.log("viva.input", Deno.args);
  // const renderer = new Renderer();
  // const walker = new Walker(v, renderer);

  const ctx = { viva: viva };
  // const result = await viva.trajectory.traverse(initialPath, ctx);
  // execute(result, initialPath, ctx);

  // await walker.start();
  return viva;
};

(async (viva) =>
  await [
    ticker("init"),
    captureProcess,
    // registry.mount,
    locals,
    boot,
    commands,
    walk,
    ticker("complete"),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(viva)))(viva);
