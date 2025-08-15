const start = performance.now();
const ticker = (name: string) => (daemon: Daemon) => {
  const ms = Math.round(performance.now() - start);
  console.log(`[PERF] init to [${name}] in [${ms}ms]`);
  return daemon;
};

import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { Daemon } from "@vivalence/typology/classes";
import { Vector, parser } from "@vivalence/vector";

import aperture from "./aperture/index.ts";
import runtimes from "./runtimes/index.ts";

import cleanup from "./lib/cleanup-ports.js";

// TODO lifecycle with a constrained state machine.
(async (daemon) =>
  await [
    ticker("lifecycle"),
    cleanup,
    // aperture.boot,
    // runtimes.boot,
    // runtimes.serve,
    // aperture.serve,
    // runtimes.install,
    ticker("alife"),
  ].reduce((acc, fn) => acc.then(fn), daemon))(Promise.resolve(new Daemon()));

// {
//   process: null,
//   // services: await loadServiceClients(config.system.daemon.services),
//   runtimes: new Map(),
//   register = new Map(), //
//   services: [],

//   twitch: new Vector(parser.sig),
//   aperture: null,
//   registry: null,
//   server: null,
//   // entities: null,
// }
