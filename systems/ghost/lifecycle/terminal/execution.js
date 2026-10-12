import { Vector, shard } from "@vivalence/typology";
import * as population from "./population.js";

export const execution = new Vector().use(population.repl).use(population.stall).do(shard.controller.hold);
