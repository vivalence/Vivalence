import { Vector } from "@vivalence/typology";

import { progress } from "./progress.js";
import { lookup } from "./lookup.js";
import { queue } from "./queue.js";
import { review } from "./review.js";

export const tools = new Vector()
  .slurp(progress)
  .slurp(lookup)
  .slurp(queue)
  .slurp(review);
