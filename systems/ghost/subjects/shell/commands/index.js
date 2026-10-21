import paladin from "@vivalence/paladin";
import { Vector } from "@vivalence/typology";
import { chrome } from "./chrome.js";
import { tail } from "./tail.js";

export const commands = new Vector().graft(chrome, tail, paladin.commands);
