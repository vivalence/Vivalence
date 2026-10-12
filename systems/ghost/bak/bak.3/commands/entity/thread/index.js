import { Vector } from "@vivalence/typology";
import { create } from "./create.js";
import { list } from "./list.js";
import { pick } from "./pick.js";

export const thread = new Vector().graft(list, create, pick);
