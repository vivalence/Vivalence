console.log("Daemon starting...");
const start = performance.now();

import registry from "@vivalence/registry";
import { services } from "@vivalence/shared";

import cleanup from "./lib/cleanup-ports.js";
// import daemonize from "./lib/daemonize.js";
import dev from "./lib/dev.js";

import { Daemon } from "@vivalence/types";
import aperture from "./aperture/index.js";
import runtimes from "./runtimes/index.ts";
import server from "./server/index.js";
import entities from "./entities/index.js";

const ticker = (name: string) => (daemon: Daemon) => {
  console.log(`[PERF] init to [${name}] in [${performance.now() - start}ms]`);
  return daemon;
};

const daemon: Daemon = {
  process: null,
  registry: null,
  aperture: null,
  services: {},
  router: null,
  server: null,
  runtimes: new Map(),
  // controller: null
};

// console.json = (value) => console.log(JSON.stringify(value, null, 2));

(async (daemon) =>
  await [
    ticker("init"),
    cleanup,
    registry.mount,
    services.mount,
    server.init,
    entities.init,
    aperture.init,
    runtimes.discover,
    runtimes.runtime,
    runtimes.register,
    runtimes.modules,
    runtimes.boot,
    // runtimes.entities,
    runtimes.serve,
    // entities.serve,
    aperture.serve,
    server.serve,
    runtimes.install,
    dev,
    // runtimes.userland,
    ticker("up"),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))(daemon);
