import loadFromRepo from "./lib/discoverRuntimes.ts";
import { loadModule, loadModuleMap } from "./lib/loadModules.ts";
import { loadServices } from "./lib/loadServices.ts";

export async function load() {
  const Runtimes = [];

  for await (const RuntimeConfig of await loadFromRepo()) {
    if (RuntimeConfig.manifest.traits.includes("INACTIVE")) continue;
    const domain = await loadModule(RuntimeConfig.domain);
    const modules = await loadModuleMap(RuntimeConfig.modules);
    const services = await loadServices(RuntimeConfig.services);

    Runtimes.push({
      ...RuntimeConfig,
      domain,
      modules,
      services,
    });
  }

  return Runtimes;
}
