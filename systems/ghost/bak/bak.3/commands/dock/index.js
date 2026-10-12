import { Vector } from "@vivalence/typology";
import { collapse } from "./collapse.js";
import { full } from "./full.js";
import { share } from "./share.js";
import { side } from "./side.js";

export const dock = new Vector().graft(collapse, full, share, side);
