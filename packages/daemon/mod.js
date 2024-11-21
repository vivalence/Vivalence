console.log("Daemon starting...");
const start = performance.now();

import cleanup from "./lib/cleanup-ports.js";
import daemonize from "./lib/daemonize.js";
import dev from "./lib/dev.js";

import api from "./modules/api/index.js";
import registry from "./modules/registry/index.js";
import server from "./modules/server/index.js";
import services from "./modules/services/index.js";

import runtimes from "./runtimes/index.js";

const ticker = (name) => (daemon) => {
  console.log(`[PERF] init to [${name}] in [${performance.now() - start}ms]`);
  return daemon;
};

(async (daemon) =>
  await [
    ticker("init"),
    cleanup,
    registry.init,
    server.init,
    services.init,
    api.init,
    runtimes.discover,
    runtimes.runtime,
    runtimes.register,
    runtimes.modules,
    runtimes.boot,
    runtimes.serve,
    api.serve,
    server.serve,
    runtimes.install,
    dev,
    // TODO: runtimes.garbage,

    runtimes.userland,
    ticker("up"),
    daemonize,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))({ runtimes: new Map() });
