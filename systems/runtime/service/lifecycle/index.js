import { Vector } from "@vivalence/typology";
import { process } from "../../gestalten/shard/index.js";
import * as resolution from "./resolution.js";

export { resolution };

export const execution = new Vector().use(process.settle).use(resolution.traits);

execution.affect(process.keepalive);
