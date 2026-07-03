import { Vector } from "@vivalence/typology";

import { activation } from "./activation.js";
import { drill } from "./drill.js";
import { riddle } from "./riddle.js";

// ── emitters · activation (train) + drill (review) + riddle (play) ──────────
export const emitter = new Vector().slurp(activation).slurp(drill).slurp(riddle);
