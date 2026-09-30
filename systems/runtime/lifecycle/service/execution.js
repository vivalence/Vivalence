import { Vector } from "@vivalence/typology";
import * as process from "../process.js";
import * as population from "./population.js";

export const execution = new Vector().use(process.settle).use(population.aperture);

execution.affect(process.keepalive);
