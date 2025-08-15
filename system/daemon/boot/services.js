import registry from "@vivalence/registry";
import { ServiceManager } from "@vivalence/typology/classes";

export async function loadServiceClients(services) {
  const manager = new ServiceManager();

  for (const [slug, config] of Object.entries(services)) {
    const service = await registry.load(config.module);
    const client = await service.client(config);

    manager.add(slug, { client, register: service, config: config.config });
  }

  return manager;
}

export async function attachServices(runtime, aperture) {
  for (const [slug, service] of Object.entries(manager.services)) {
    if (!service.register.manifest.traits?.includes("ATTACHED")) continue;

    console.log({
      service,
    });
    await service.register.server(
      { config: service.config, manifest: service.register.manifest },
      aperture.branch(`/${slug}`),
    );
  }
}

export default {
  managed: loadServiceClients,
  attach: attachServices,
};
// vs. loadServiceServers(config, {trajectory})
// export async function bootServiceServers(services, bootmw) {
// for (const [slug, config] of Object.entries(services)) {
//   const service = await registry.load(config.service);

//   if (service.server) await service.server(serviceconfig, bootmw({}));
// }
// }

// await bootServiceServers(runtime.services,(config,ctx)=>(ctx.assign({vector})))
//   const host = {trajectory: client.trajectory.branch(`/@${runtimeslug}/${serviceslug}`),};

// classes for modules, domain, runtime, daemon.
