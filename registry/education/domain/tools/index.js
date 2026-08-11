import { Vector } from "@vivalence/typology";

import { pull } from "./pull.js";
import { review } from "./review.js";

export const tools = new Vector().slurp(pull).slurp(review);
