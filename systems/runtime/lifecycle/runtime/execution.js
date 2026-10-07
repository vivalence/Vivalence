import { Vector } from "@vivalence/typology";
import * as process from "../process.js";
import * as population from "./population.js";
import * as resolution from "./resolution.js";
import * as integration from "./integration.js";
import * as aperture from "./aperture/index.js";
import * as host from "../host/index.js";
import { execution as daemon } from "../daemon/execution.js";
import { execution as service } from "../service/execution.js";
import { execution as mode } from "../mode/execution.js";

export const execution = new Vector()
  .use(process.settle)
  .use(population.validate)
  .use(population.registry)
  .use(population.datamap)
  .use(population.aperture)
  .use(population.acid)
  .use(aperture.lighthouse)
  .use(aperture.userspace)
  .use(population.modes)
  .use(resolution.modes(mode))
  .use(host.aperture.metadata)
  .use(host.aperture.cortex)
  .use(population.services)
  .use(population.daemons)
  .use(resolution.services(service))
  .use(resolution.daemons(daemon))
  .use(resolution.attach)
  .use(resolution.expose)
  .use(resolution.metadata)
  .use(integration.prune)
  .use(integration.ledger)
  .use(integration.patrol)
  .use(integration.serve);

execution.affect(process.keepalive);
