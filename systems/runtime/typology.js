import * as runtime from "./subjects/runtime/index.js";
import * as lighthouse from "./subjects/lighthouse/index.js";
import * as daemon from "./subjects/daemon/index.js";
import * as service from "./subjects/service/index.js";
import * as mode from "./subjects/mode/index.js";

export * from "./entities/index.ts";
export * as entities from "./entities/index.ts";
export * as schematics from "./schematics/index.js";
export * as gestalten from "./gestalten/index.js";
export { Runtime } from "./subjects/runtime/prototype.js";
export { Lighthouse } from "./subjects/lighthouse/prototype.js";
export { Daemon } from "./subjects/daemon/prototype.js";
export { Service } from "./subjects/service/prototype.js";

export const prototypes = {
  Runtime: runtime.Runtime,
  Lighthouse: lighthouse.Lighthouse,
  Daemon: daemon.Daemon,
  Service: service.Service,
};

export const lifecycle = {
  runtime: runtime.lifecycle,
  lighthouse: lighthouse.lifecycle,
  daemon: daemon.lifecycle,
  service: service.lifecycle,
  mode: mode.lifecycle,
};

export const factories = {
  runtime: runtime.factory,
  lighthouse: lighthouse.factory,
  daemon: daemon.factory,
  service: service.factory,
  mode: mode.factory,
};

export const traits = { mode: mode.traits, lighthouse: lighthouse.traits, service: service.traits };

export const apertures = { lighthouse: lighthouse.apertures };
