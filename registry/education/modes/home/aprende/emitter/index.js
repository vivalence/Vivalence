import { Vector } from "@vivalence/typology";

import { deck } from "./deck.js";
import { nyan } from "./nyan.js";
import { riddle } from "./riddle.js";
// import { flashcard } from "./flashcard.js";
// import { translation } from "./translation.js";
// import { drill } from "./drill.js";

export const emitter = new Vector().slurp(deck).slurp(nyan).slurp(riddle);
