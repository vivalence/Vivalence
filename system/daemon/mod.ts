const start = performance.now();
const ticker = (name: string) => (daemon: Daemon) => {
  console.log(`[PERF] init to [${name}] in [${performance.now() - start}ms]`);
  return daemon;
};
ticker("init")();

import config from "@vivalence/config";
import registry from "@vivalence/registry";

import { loadServiceClients } from "./locals/loadServiceClients.js";

import emitter from "./locals/emitter/index.js";
import entities from "./entities/index.js";
import aperture from "./aperture/index.ts";
import runtimes from "./runtimes/index.ts";
import cleanup from "./lib/cleanup-ports.js";

const daemon = {
  process: null,
  registry: await registry.init(),
  services: {
    clients: await loadServiceClients(config.services),
  },
  aperture: null,
  entities: {},
  runtimes: new Map(),
  server: null,
  emitter: emitter.create(),
};

(async (daemon) =>
  await [
    cleanup,
    aperture.init,
    entities.init,
    runtimes.init,
    //     runtimes.serve,
    //     aperture.serve,
    ticker("up"),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))(daemon);
