import { Vector } from "@vivalence/typology";
import { start } from "./start.js";
import { stop } from "./stop.js";

export const application = new Vector().graft(start, stop);
