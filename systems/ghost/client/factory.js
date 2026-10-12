import { steer } from "@vivalence/typology";
import { Client } from "./prototype.js";
import { execution } from "./lifecycle/index.js";
import { chrome } from "./commands/chrome.js";

export const factory = (surface) => async (shellDie) => {
  const clientDie = new Client({ controller: shellDie.controller.branch("client"), mask: shellDie.mask, register: shellDie.register, instance: shellDie.instance, surface });
  clientDie.repl.graft(chrome);
  await steer.dispatch.execute(execution, clientDie);
  if (clientDie.controller.status.is("FAILED")) throw clientDie.controller.status.reflection.error;
};
