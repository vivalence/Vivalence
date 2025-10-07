import { object, is } from "@vivalence/shared";

import register from "./lib.js";

let initialized = false;

export async function init(config = {}) {
  if (!initialized) {
    if (!config.register)
      throw new Error("registry initiated without register path");

    await register.init(config);
    initialized = true;
  }

  return { load, loadMany, loadMany };
}

export async function load(query) {
  if (typeof query !== "string" && typeof query.module !== "string")
    throw new Error();
  const module = await register.lookup(query);
  return module;
}

export async function loadMany(many) {
  return await Promise.all(many.map((query) => load(query)));
}

export async function loadMap(many) {
  const loadedModules = await Promise.all(
    Object.entries(many).map(async ([slug, query]) => {
      if (typeof query === "string") {
        return [slug, await load(query)];
      } else if (typeof query.module === "string") {
        return [slug, await load(query.module)];
      } else if (is.array(query)) {
        return [slug, await loadMany(query)];
      } else if (is.object(query)) {
        return [slug, await loadMap(query)];
      }
    }),
  );

  return Object.fromEntries(loadedModules.filter((entry) => entry !== null));
}

export default { init, load, loadMany, loadMap };
