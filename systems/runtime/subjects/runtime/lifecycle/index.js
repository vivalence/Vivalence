import { Vector } from "@vivalence/typology";
import { process } from "../../../gestalten/shard/index.js";
import * as population from "./1-population.js";
import * as resolution from "./2-resolution.js";
import * as integration from "./3-integration.js";
import { factory as lighthouse } from "../../lighthouse/factory.js";
import { factory as daemon } from "../../daemon/factory.js";
import { factory as service } from "../../service/factory.js";
import { factory as mode } from "../../mode/factory.js";

export { population, resolution, integration };

export const execution = new Vector()
  .use(process.settle)
  .use(population.validate)
  .use(integration.ledger)
  .use(population.aperture)
  .use(integration.serve)
  .use(population.registry)
  .use(population.datamap)
  .use(population.acid)
  .use(population.lighthouse)
  .use(resolution.lighthouse(lighthouse))
  .use(integration.userspace)
  .use(population.modes)
  .use(resolution.modes(mode))
  .use(integration.twitch)
  .use(integration.entities)
  .use(integration.metadata)
  .use(integration.cortex)
  .use(population.services)
  .use(population.daemons)
  .use(resolution.services(service))
  .use(resolution.daemons(daemon))
  .use(resolution.attach)
  .use(resolution.expose)
  .use(resolution.metadata)
  .use(integration.prune)
  .use(integration.patrol);

execution.affect(process.keepalive);
