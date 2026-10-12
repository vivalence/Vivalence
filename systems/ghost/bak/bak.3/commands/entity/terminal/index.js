import { Vector } from "@vivalence/typology";
import { create } from "./create.js";
import { list } from "./list.js";
import { pick } from "./pick.js";
import { seat } from "./seat.js";

export const terminal = new Vector().graft(list, create, pick, seat);
