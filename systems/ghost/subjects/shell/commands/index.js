import paladin from "@vivalence/paladin";
import { Vector } from "@vivalence/typology";
import { chrome } from "./chrome.js";
import { tail } from "./tail.js";
import { usage } from "./help.js";

export const commands = new Vector()
  .open({ nature: "/help", valence: "the shell's commands. Example: viva help" }, (shellDie) => usage(shellDie, commands))
  .graft(chrome, tail, paladin.commands);
