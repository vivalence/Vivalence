const start = performance.now();
const ticker = (name: string) => (daemon: Daemon) => {
  console.log(`[PERF] init to [${name}] in [${performance.now() - start}ms]`);
  return daemon;
};
ticker("init")();

import config from "@vivalence/config";
import registry from "@vivalence/registry";

import { loadServiceClients } from "./boot/services.js";
import entities from "./boot/entities.js";
import aperture from "./aperture/index.ts";

import emitter from "./locals/emitter/index.js";
import runtimes from "./runtimes/index.ts";

import cleanup from "./lib/cleanup-ports.js";

const daemon = {
  process: null,
  services: await loadServiceClients(config.daemon.services),
  aperture: null,
  entities: {},
  runtimes: new Map(),
  server: null,
  emitter: emitter.create(),
};

(async (daemon) =>
  await [
    cleanup,
    aperture.boot,
    entities.boot,
    runtimes.boot,
    runtimes.serve,
    aperture.serve,
    runtimes.install,
    ticker("up"),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))(daemon);
