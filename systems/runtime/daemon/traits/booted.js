import { is } from "@vivalence/typology";

// boot(daemon, mode) runs after every mode's traits are wired; whatever it
// returns is the teardown, owed back at daemon disintegrate.
export const BOOTED = (mode, daemon) => {
  if (!is.fn(mode.module.boot)) {
    console.warn(
      `[BOOTED] ${mode.manifest.type}/${mode.manifest.slug} declares BOOTED without a boot(daemon, mode) export`,
    );
    return;
  }
  let teardown;
  return {
    finalize: async () => {
      teardown = await mode.module.boot(daemon, mode);
    },
    terminate: async () => {
      if (is.fn(teardown)) await teardown();
    },
  };
};
