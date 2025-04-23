import config from "@vivalence/config";
import { deepClone } from "@vivalence/shared";

import register from "./lib.js";

let initialized = false;
export async function init(registryConfig = {}) {
  if (!initialized) {
    if (!registryConfig.modulesRootDir)
      registryConfig.modulesRootDir = config.env.get("VIVA_MODULES_DIR");
    await register.init(registryConfig);
  }
  initialized = true;
}

export async function load(query) {
  if (!initialized) await init();
  if (typeof query !== "string" && query.manifest) return query;
  const module = await register.lookup(query);
  // console.log(query, module);
  // return deepClone(module);
  return module;
}

export async function loadMany(many) {
  if (!initialized) await init();
  return await Promise.all(many.map((query) => load(query)));
}

export async function mount(client) {
  await init();
  client.registry = { load, loadMany };
  return client;
}

export default { init, load, loadMany, mount };
