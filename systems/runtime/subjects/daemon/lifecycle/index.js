import { Vector } from "@vivalence/typology";
import { process } from "../../../gestalten/shard/index.js";
import * as population from "./population.js";
import * as resolution from "./resolution.js";
import * as integration from "./integration.js";
import { factory as mode } from "../../mode/factory.js";

export { population, resolution, integration };

export const execution = new Vector()
  .use(process.settle)
  .use(population.core)
  .use(population.wiring)
  .use(population.datamap)
  .use(population.acid)
  .use(population.providers)
  .use(population.modes)
  .use(resolution.domain)
  .use(resolution.modes(mode))
  .use(integration.datamap)
  .use(integration.entities)
  .use(integration.metadata)
  .use(integration.cortex)
  .use(integration.call)
  .use(integration.prune);

execution.affect(process.keepalive);
