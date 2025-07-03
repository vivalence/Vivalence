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

export class Runtime {
  statics = {};
  manifest = {};
  config = {};

  modules = {};
  services = {};
  aperture = null;
  entities = null;

  emitter = null;
  hooks = null;

  schema = {};

  constructor(config: any) {
    this.config = config;
    this.manifest = config.manifest;
    this.statics = config.statics;
  }
}

// export class Runtime
// export class Domain
// export class Module
