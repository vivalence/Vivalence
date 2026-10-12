import { atom, control, traits as belt } from "@vivalence/typology";
import * as catalog from "../../traits/lighthouse/index.js";

export const traits = async (die, next) => {
  for (const finalize of await belt.stagger(die.client.runtime.lighthouse, die, catalog)) await finalize();
  await next();
};

export const authorized = async (die, next) => {
  await Promise.race([atom.until(die.client.runtime.lighthouse.$isAuthorized, Boolean, die.controller.abort.signal), control.hold(die.controller)]);
  if (await die.controller.proceed()) await next();
};
