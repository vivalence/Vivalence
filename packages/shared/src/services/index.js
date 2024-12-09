import { deepMerge } from "@vivalence/shared";
import config from "@vivalence/config";

async function mount(client) {
  client.services = deepMerge({}, client.services);

  for (const [serviceKey, serviceSlug] of Object.entries(config.services)) {
    const ServiceModule = await client.registry.load(serviceSlug);

    const service = await ServiceModule.client(client);
    service.Module = ServiceModule;

    client.services[serviceKey] = service;
  }

  return client;
}

export default { mount };
