import { Vector } from "@vivalence/typology";
import { buffer } from "./buffer/index.js";
import { terminal } from "./terminal/index.js";
import { thread } from "./thread/index.js";

export const entity = new Vector().graft(terminal, thread, buffer);
