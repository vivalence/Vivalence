import { Vector } from "@vivalence/typology";
import { close } from "./close.js";
import { collapse } from "./collapse.js";
import { esc } from "./esc.js";
import { full } from "./full.js";
import { pick } from "./pick.js";

export const key = new Vector().graft(esc, full, close, collapse, pick);
