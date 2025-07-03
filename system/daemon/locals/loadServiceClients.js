import registry from "@vivalence/registry";
import { ServiceClients } from "@vivalence/types/classes";

export async function loadServiceClients(services) {
  const clients = new ServiceClients();

  for (const [slug, config] of Object.entries(services)) {
    const service = await registry.load(config.service);
    const client = await service.client(config);

    clients.add(slug, {
      client,
      service,
      config,
    });
  }

  return clients;
}

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
