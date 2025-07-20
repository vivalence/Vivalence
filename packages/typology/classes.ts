// Context, Path, Blacklist, Scope, etc

export class ServiceManager {
  services = {};
  constructor() {
    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        if (prop in target.services) return target.services[prop].client;
        return undefined;
      },
    });
  }
  add(slug, service) {
    this.services[slug] = service;
    return this;
  }
}

export class Runtime {
  config = {};
  manifest = {};
  statics = {};
  register = {}; //
  services = {}; // clients
  domain = { data: {}, modules: {} };
  ontology = null;
  schema = {};
  modules = {};
  entities = null;
  aperture = null;
  emitter = null;
  // [any]: any

  constructor(config: any) {
    this.config = config;
    this.manifest = config.manifest;
    this.statics = config.statics;
  }
}

// export class Runtime
// export class Domain
// export class Module
