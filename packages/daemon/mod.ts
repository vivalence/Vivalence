const start = performance.now();

// import daemonize from "./lib/daemonize.js";
// import dev from "./lib/dev.js";
// import { Daemon } from "@vivalence/types";
// import {Daemon} from "@vivalence/types"

import registry from "@vivalence/registry";
import cleanup from "./lib/cleanup-ports.js";
import services from "./services/index.js";

import server from "./locals/server/index.js";
import routes from "./routes/index.js";
import runtimes from "./runtimes/index.ts";
import entities from "./entities/index.js";

const ticker = (name: string) => (daemon: Daemon) => {
  console.log(`[PERF] init to [${name}] in [${performance.now() - start}ms]`);
  return daemon;
};
// console.json=data

const daemon = {
  // <IntelligentMap>
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
    registry.mount,
    services.init,
    server.init,
    routes.init,
    routes.boot,
    runtimes.discover,
    entities.init,
    runtimes.init,
    runtimes.register,
    runtimes.modules,
    runtimes.boot,
    runtimes.apertures,
    runtimes.serve,
    routes.serve,
    server.serve,
    runtimes.install,
    // hooks.runtime.postInstall
    // dev,
    // runtimes.userland,
    ticker("up"),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))(daemon);
