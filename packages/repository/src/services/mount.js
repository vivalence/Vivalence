import Registry from "@vivalence/registry";

export default async function mount(configMap) {
  const serviceClients = {};

  for (const [serviceKey, serviceConfig] of Object.entries(configMap)) {
    if (typeof serviceConfig.service !== "string") {
      throw new Error("Attempt to mount invalid Service");
    }

    const ServiceModule = await Registry.load(serviceConfig.service);
    const client = await ServiceModule.client(serviceConfig);

    client.Module = ServiceModule;
    client.service = serviceConfig.service;
    client.config = serviceConfig.config;
    client.isMounted = true;

    serviceClients[serviceKey] = client;
  }
  return serviceClients;
}
