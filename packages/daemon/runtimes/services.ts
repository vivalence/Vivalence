import { Daemon } from "@vivalence/types";
import { services as servicesHelper } from "@vivalence/shared";

class ServiceManager {
  clients = {};
  constructor() {
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        if (prop in target.clients) return target.clients[prop];
        return undefined;
      },
    });
  }
  add(name, client) {
    this.clients[name] = client;
  }
}

export default function loadRuntimeServices(daemon) {
  return async (runtime) => {
    runtime.services = new ServiceManager();

    const clients = await servicesHelper.mountClients(runtime.Modules.Runtime.services, runtime);

    [daemon.services, clients].map((services) => {
      for (const [service, client] of Object.entries(services)) {
        runtime.services.add(service, client);
      }
    });
    return runtime;
  };
}
