import { Vector } from "@vivalence/typology";
import { process } from "../../gestalten/shard/index.js";
import * as population from "./population.js";
import * as resolution from "./resolution.js";
import * as integration from "./integration.js";
import * as aperture from "./aperture/index.js";
import { execution as mode } from "../mode/execution.js";

export const execution = new Vector()
  .use(process.settle)
  .use(population.core)
  .use(population.wiring)
  .use(population.datamap)
  .use(population.acid)
  .use(population.services)
  .use(population.modes)
  .use(resolution.domain)
  .use(resolution.modes(mode))
  .use(resolution.freight)
  .use(aperture.datamap)
  .use(aperture.freight)
  .use(aperture.host.entities)
  .use(aperture.host.metadata)
  .use(aperture.host.cortex)
  .use(integration.call)
  .use(integration.prune);

execution.affect(process.keepalive);
