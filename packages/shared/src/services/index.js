import registry from "@vivalence/registry";

// client may be viva, daemon, or anything that implements {services}
// in environments where registry is available

// viva or daemon ctx
async function mountClients(ctx) {
  for (const [serviceKey, serviceDefinition] of Object.entries(ctx.services)) {
    // if (typeof serviceDefinition.service !=== 'string') do stuff.
    const ServiceModule = await registry.load(serviceDefinition.service);

    const service = await ServiceModule.client(service, ctx);
    service.Module = ServiceModule;
    service.isMounted = true;

    ctx.services[serviceKey] = service;
  }

  return ctx;
}

async function mountServices(ctx) {
  for (const [serviceKey, serviceDefinition] of Object.entries(ctx.services)) {
    // if (typeof serviceDefinition.service !=== 'string') do stuff.
    const ServiceModule = await registry.load(serviceDefinition.service);

    const service = await ServiceModule.service(service, ctx);
    service.Module = ServiceModule;
    service.isMounted = true;

    ctx.services[serviceKey] = service;
  }

  return ctx;
}

export default { mountClients, mountServices };
