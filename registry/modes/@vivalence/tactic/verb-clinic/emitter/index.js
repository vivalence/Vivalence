import { Vector } from "@vivalence/typology";

import classPattern from "./class.js";
import regularity from "./regularity.js";

export const emitter = new Vector()
  .open("/class", classPattern)
  .open("/regularity", regularity);
