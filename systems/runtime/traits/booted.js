import { is } from "@vivalence/typology";

// boot(host, mode) runs after every mode's traits are wired; whatever it
// returns is the teardown, owed back at host disintegrate.
export const BOOTED = (mode, host) => {
  let teardown;
  return {
    finalize: async () => {
      teardown = await mode.module.boot(host, mode);
    },
    terminate: async () => {
      if (is.fn(teardown)) await teardown();
    },
  };
};
