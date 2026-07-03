import { Vector } from "@vivalence/typology";

import { activation } from "./activation.js";
import { drill } from "./drill.js";
import { query } from "./query.js";
import { riddle } from "./riddle.js";

// ── tools · one read (query) + three buffer generators ──────────────────────
// TOOLED slurps this into daemon.cortex.tools.branch("aprende"); the aprende
// harness scopes the same branch onto /object (the helpdesk path).
export const tools = new Vector().slurp(activation); //.slurp(activation).slurp(drill).slurp(riddle);
