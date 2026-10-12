import { Vector, shard } from "@vivalence/typology";
import * as population from "./population.js";
import * as resolution from "./resolution.js";

export const execution = (mode) =>
  new Vector()
    .use(population.status)
    .use(population.metadata)
    .use(population.cortex)
    .use(population.modes)
    .use(resolution.modes(mode))
    .use(resolution.healthy)
    .do(shard.controller.hold);
