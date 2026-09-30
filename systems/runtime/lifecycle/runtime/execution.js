import { Vector } from "@vivalence/typology";
import * as process from "../process.js";
import * as population from "./population.js";
import * as resolution from "./resolution.js";
import * as integration from "./integration.js";
import { execution as daemon } from "../daemon/execution.js";
import { execution as service } from "../service/execution.js";

export const execution = new Vector()
  .use(process.settle)
  .use(population.validate)
  .use(population.registry)
  .use(population.datamap)
  .use(population.aperture)
  .use(population.services)
  .use(population.daemons)
  .use(resolution.services(service))
  .use(resolution.daemons(daemon))
  .use(resolution.attach)
  .use(resolution.expose)
  .use(resolution.metadata)
  .use(integration.ledger)
  .use(integration.patrol)
  .use(integration.serve)
  .use(integration.announce);

execution.affect(process.keepalive);
