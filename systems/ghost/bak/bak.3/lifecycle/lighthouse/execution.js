import { Vector } from "@vivalence/typology";
import * as population from "./population.js";
import * as resolution from "./resolution.js";
import * as integration from "./integration.js";

export const execution = new Vector()
  .use(population.credentials)
  .use(integration.credentials)
  .use(resolution.traits)
  .use(resolution.authorized);
