// shared should not read registry.
import registry from "@vivalence/registry";

// maybe move to /types? /types/classes types/entities

// export class Runtime
// export class Domain
// export class Module

export class ServiceClients {
  clients = {};
  constructor() {
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        if (prop in target.clients) return target.clients[prop].client;
        return undefined;
      },
    });
  }
  add(name, client) {
    this.clients[name] = client;
    return this;
  }
}

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
