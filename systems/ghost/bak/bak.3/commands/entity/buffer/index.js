import { Vector } from "@vivalence/typology";
import { close } from "./close.js";
import { open } from "./open.js";

export const buffer = new Vector().graft(close, open);
