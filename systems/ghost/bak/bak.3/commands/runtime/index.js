import { Vector } from "@vivalence/typology";
import { daemon } from "./daemon/index.js";
import { mode } from "./mode/index.js";

export const runtime = new Vector().graft(daemon, mode);
