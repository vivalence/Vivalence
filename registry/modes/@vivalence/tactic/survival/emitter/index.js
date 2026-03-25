import { Vector } from "@vivalence/typology";

import warmup from "./warmup.js";
import buildup from "./buildup.js";
import exercise from "./exercise.js";
import drill from "./drill.js";
import cooldown from "./cooldown.js";

export const emitter = new Vector()
  .open("/warmup", warmup)
  .open("/buildup", buildup)
  .open("/exercise", exercise)
  .open("/drill", drill)
  .open("/cooldown", cooldown);
