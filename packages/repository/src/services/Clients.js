// import Registry from "@vivalence/registry";
import mount from "./mount.js";

export default class ServiceClientManager {
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

    return this;
  }
  join(manager) {
    for (const [service, client] of Object.entries(manager.clients)) {
      this.add(service, client);
    }
    return this;
  }
  async mount(configMap) {
    const services = await mount(configMap);

    for (const [key, client] of Object.entries(services)) {
      this.add(key, client);
    }

    return this;
  }
}
