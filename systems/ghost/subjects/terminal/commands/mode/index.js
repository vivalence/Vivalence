import { Vector } from "@vivalence/typology";
import { list } from "./list.js";
import { pick } from "./pick.js";

export const mode = new Vector().graft(list, pick);
