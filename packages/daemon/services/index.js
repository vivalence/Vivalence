import { deepMerge } from "@vivalence/shared";
import config from "@vivalence/config";

async function init(daemon) {
  daemon.services = deepMerge({}, daemon.services);

  for (const [serviceKey, serviceSlug] of Object.entries(config.services)) {
    const Module = await daemon.registry.load(serviceSlug);
    const client = Module.client(daemon);
    client.Module = Module;
    daemon.services[serviceKey] = client;
  }

  return daemon;
}

export default { init };
