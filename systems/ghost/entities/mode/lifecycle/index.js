import { Vector, traits } from "@vivalence/typology";
import * as catalog from "../traits/index.js";

export const stdout = async (modeDie, next) => {
  try {
    await next();
    modeDie.mode.stdout.start();
  } catch (error) {
    modeDie.mode.stdout.fault(error);
    throw error;
  }
};

export const core = async (modeDie, next) => {
  modeDie.mode.reference = modeDie.client.mask.reference.branch(modeDie.mode.reference.absolute);
  await next();
};

export const staggered = async (modeDie) => {
  for (const finalize of await traits.stagger(modeDie.mode, modeDie.client, catalog)) await finalize();
};

export const execution = new Vector().use(stdout).use(core).do(staggered);
