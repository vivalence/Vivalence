console.log("Daemon starting...");
const start = performance.now();

import cleanup from "./lib/cleanup-ports.js";
import daemonize from "./lib/daemonize.js";
import dev from "./lib/dev.js";

import aperture from "./aperture/index.js";
import registry from "./registry/index.js";
import server from "./server/index.js";
import services from "./services/index.js";

import runtimes from "./runtimes/index.js";

const ticker = (name) => (daemon) => {
  console.log(`[PERF] init to [${name}] in [${performance.now() - start}ms]`);
  return daemon;
};

let daemon = {
  process: null,
  registry: null,
  aperture: null,
  services: {},
  router: null,
  server: null,
  runtimes: new Map(),
  // controller: null
};

(async (daemon) =>
  await [
    ticker("init"),
    cleanup,
    registry.init,
    server.init,
    services.init,
    aperture.init,
    runtimes.discover,
    runtimes.runtime,
    runtimes.register,
    runtimes.modules,
    runtimes.boot,
    runtimes.serve,
    aperture.serve,
    server.serve,
    runtimes.install,
    dev,
    // runtimes.userland,
    ticker("up"),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))(daemon);
