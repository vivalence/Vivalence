import { Vector } from "@vivalence/typology";
import * as population from "./population.js";
import * as resolution from "./resolution.js";

export { population, resolution };

export const execution = new Vector().use(population.core);

execution.affect(resolution.traits);
