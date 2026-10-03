import { Vector } from "@vivalence/typology";
import * as process from "../process.js";
import * as resolution from "./resolution.js";

export const execution = new Vector().use(process.settle).use(resolution.traits);

execution.affect(process.keepalive);
