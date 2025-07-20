import config from "@vivalence/config";
import { deepClone } from "@vivalence/shared";

import register from "./lib.js";

let initialized = false;

export async function init(registryConfig = {}) {
  if (!initialized) {
    if (!registryConfig.rootDir)
      registryConfig.rootDir = config.env.get("VIVA_REGISTRY_DIR");

    await register.init(registryConfig);
    initialized = true;
  }

  return { load, loadMany };
}

export async function load(query) {
  await init();
  // if (typeof query !== "string" && query.manifest) return query;
  if (typeof query !== "string" && query.manifest) throw new Error();
  const module = await register.lookup(query);
  return module;
}

export async function loadMany(many) {
  await init();
  return await Promise.all(many.map((query) => load(query)));
}

export async function loadMap(many) {
  await init();

  const loadedModules = await Promise.all(
    Object.entries(many).map(async ([slug, query]) => {
      if (typeof query === "string") {
        return [slug, await load(query)];
      } else if (Array.isArray(query)) {
        return [slug, await loadMany(query)];
        // } else if (!!query.service) {
        // console.log(slug, query);
        // // return [slug, await load(query.service)];
      }
    }),
  );

  return Object.fromEntries(loadedModules.filter((entry) => entry !== null));
}

export default { init, load, loadMany, loadMap };
