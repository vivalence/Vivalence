const start = performance.now();

import registry from "@vivalence/registry";

import cleanup from "./lib/cleanup-ports.js";

import agents from "./agents/index.js";
import mcp from "./mcp/index.js";
import entities from "./entities/index.js";
import services from "./services/index.js";
import aperture from "./aperture/index.ts";
import runtimes from "./runtimes/index.ts";
import emitter from "./locals/emitter/index.js";

const ticker = (name: string) => (daemon: Daemon) => {
  console.log(`[PERF] init to [${name}] in [${performance.now() - start}ms]`);
  return daemon;
};
// console.json=data

const daemon = {
  process: null,
  registry: null,
  aperture: null,
  emitter: emitter.create(),
  entities: {},
  services: {},
  runtimes: new Map(),
  server: null,
  mcp: null,
};

(async (daemon) =>
  await [
    ticker("init"),
    cleanup,
    registry.mount,
    aperture.init,
    services.init,
    entities.init,
    mcp,
    agents,
    runtimes.init,
    runtimes.serve,
    aperture.serve,
    ticker("up"),
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve(daemon)))(daemon);
