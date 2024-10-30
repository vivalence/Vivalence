import config from "@vivalence/config";
import { deepClone } from "@vivalence/shared";

import register from "./lib.js";

let initialized = false;

async function init(registryConfig = {}) {
  if (!initialized) {
    if (!registryConfig.modulesRootDir)
      registryConfig.modulesRootDir = config.env.get("VIVA_MODULES_DIR");
    await register.init(registryConfig);
  }
  initialized = true;
}

async function load(query) {
  if (!initialized) await init();
  if (typeof query !== "string" && query.manifest) return query;
  return deepClone(await register.lookup(query));
}

async function loadMany(many) {
  if (!initialized) await init();
  return await Promise.all(many.map((query) => load(query)));
}

async function verify({ manifest, modules }) {
  // verify module
  // check compatibility and completeness.
}

async function build({ manifest, modules }) {
  // build whole module.
  // get passed module, get recipie from manifest.type, build and verify
}

export default { init, load, loadMany, build };
