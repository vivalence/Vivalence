import config from "@vivalence/config";

async function init(daemon) {
  daemon.services = daemon.services || {};

  for (const [serviceKey, serviceSlug] of Object.entries(config.services)) {
    config.services[serviceKey] = await daemon.registry.load(serviceSlug);
    daemon.services[serviceKey] = config.services[serviceKey].client();
  }

  return daemon;
}

export default { init };
