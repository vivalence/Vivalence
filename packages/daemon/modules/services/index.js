import { deepMerge } from "@vivalence/shared";
import config from "@vivalence/config";

async function init(daemon) {
  daemon.Modules = deepMerge({ services: {} }, daemon.Modules);
  daemon.services = daemon.services || {};

  for (const [serviceKey, serviceSlug] of Object.entries(config.services)) {
    daemon.Modules.services[serviceKey] = await daemon.registry.load(serviceSlug);
  }

  for (const [serviceKey, serviceSlug] of Object.entries(config.services)) {
    daemon.services[serviceKey] = daemon.Modules.services[serviceKey].client(daemon);
  }

  return daemon;
}

export default { init };
