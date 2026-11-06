import { is } from "@vivalence/typology";

// boot(context, mode) runs after every mode's traits are wired; whatever it
// returns is the teardown, owed back at context disintegrate.
export const BOOTED = (mode, modeDie) => {
  let teardown;
  return {
    finalize: async () => {
      teardown = await mode.module.boot(modeDie, mode);
    },
    terminate: async () => {
      if (is.fn(teardown)) await teardown();
    },
  };
};
