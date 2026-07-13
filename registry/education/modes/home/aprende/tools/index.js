import { Vector } from "@vivalence/typology";

import { flashcard } from "./flashcard.js";
import { translation } from "./translation.js";
// import { activation } from "./activation.js";
// import { drill } from "./drill.js";
// import { query } from "./query.js";
// import { riddle } from "./riddle.js";

// TOOLED slurps this into daemon.cortex.tools.branch("aprende"); the aprende
// harness scopes the same branch onto /object (the helpdesk path).
export const tools = new Vector().slurp(flashcard).slurp(translation);
