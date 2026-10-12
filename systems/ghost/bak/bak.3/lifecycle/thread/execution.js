import { Vector, shard } from "@vivalence/typology";
import * as population from "./population.js";

export const execution = new Vector().use(population.buffer).use(population.activity).do(shard.controller.hold);
