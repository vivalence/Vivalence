import { Vector } from "@vivalence/typology";
import * as population from "./1-population.js";
import * as resolution from "./2-resolution.js";

export { population, resolution };

export const execution = new Vector()
  .use(population.stdout)
  .use(population.providers)
  .use(population.core);

execution.affect(resolution.traits);
