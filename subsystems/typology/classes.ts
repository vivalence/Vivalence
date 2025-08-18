// classes implement the shapes defined in schema
// classes import functional components from shared

// examples are:
// Path, URL, Timerange, Config, Daemon, Runtime, Context, Blacklist, Scope, etc

export * from "./classes/env.js";
export * from "./classes/daemon.js";
export * from "./classes/runtime.js";

// export class ServiceManager {
//   services = {};
//   constructor() {
//     return new Proxy(this, {
//       get(target, prop, receiver) {
//         if (prop in target) return Reflect.get(target, prop, receiver);
//         if (prop in target.services) return target.services[prop].client;
//         return undefined;
//       },
//     });
//   }
//   add(slug, service) {
//     this.services[slug] = service;
//     return this;
//   }
// }

// // export class Module
