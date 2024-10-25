console.log("Daemon starting...");
const start = performance.now();

import cleanup from "./lib/cleanup-ports.js";
import daemonize from "./lib/daemonize.js";

import registry from "./modules/registry/index.js";
import server from "./modules/server/index.js";
import supabase from "./modules/supabase/index.js";

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

    supabase,
    // database.init,
    // identity.init,
    // management.init,

    runtimes.discover,
    runtimes.runtime,
    runtimes.register,
    runtimes.modules,
    runtimes.boot,
    runtimes.serve,
    // database.serve,
    // identity.serve,
    // management.serve,
    server.serve,
    ticker("up"),
    runtimes.install,

    // runtimes.garbage,
    // runtimes.userland,
    // ticker("up"),
    daemonize,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))({ runtimes: new Map() });
