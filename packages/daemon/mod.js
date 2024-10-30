console.log("Daemon starting...");
const start = performance.now();

import cleanup from "./lib/cleanup-ports.js";
import daemonize from "./lib/daemonize.js";
import dev from "./lib/dev.js";

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
    server.create,
    services.clients,
    // TODO: management.init,
    // ticker("services setup"),
    runtimes.discover,
    // ticker("runtimes discovered"),
    runtimes.runtime,
    // ticker("runtimes setup"),
    runtimes.register,
    // ticker("runtimes registered"),
    runtimes.modules,
    // ticker("runtime modules setup"),
    runtimes.boot,
    // ticker("runtime modules booted"),
    runtimes.serve,
    // TODO: management.serve,
    server.serve,
    // ticker("daemon serving"),
    runtimes.install,
    // TODO: runtimes.garbage,
    runtimes.userland,
    ticker("up"),
    daemonize,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))({ runtimes: new Map() });
