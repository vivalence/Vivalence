// populate is for tools, maps and repositories
import config from "@vivalence/config";
import { Url, Path, Module } from "@vivalence/typology";
import * as lifecycle from "../runtime/index.js";

export async function runtimes(daemon) {
  for (const runtimeconfig of config.runtimes) {
    const slug = runtimeconfig.manifest.slug;
    const rme = {
      slug,
      path: new Path(`/runtime/${slug}`),
      url: new Url(`/runtime/${slug}`, daemon.config.url),
      instance: new lifecycle.construct.Runtime(runtimeconfig),
      config: runtimeconfig,

      register: {
        lighthouse: await daemon.registry.load(runtimeconfig.lighthouse),
        database: await daemon.registry.load(runtimeconfig.database),
        modules: await daemon.registry.loadMap(runtimeconfig.modules),
        services: await daemon.registry.loadMap(runtimeconfig.services),
      },

      maps: {
        orm: {},
        entities: {},
        modules: {},
        traits: {},
        services: {},
      },
    };

    lifecycle.construct.maps(rme);

    rme.instance.attached = new Url(
      `/attached/runtime/${rme.slug}`,
      daemon.config.url,
    );

    daemon.runtimes.add(rme);
  }
}

export async function services(daemon) {
  // for (const runtimeconfig of config.runtimes) {
  // const sme = {
  // slug: runtimeconfig.manifest.slug,
  // status: new Status(),
  // connection: new Connection(),
  // path: new Path(`/runtime/${runtimeconfig.manifest.slug}`),
  // url: new URL(`/runtime/${runtimeconfig.manifest.slug}`, daemon.config.url,),
  // instance: new lifecycle.Runtime(runtimeconfig),
  // config: runtimeconfig,
  // register: await daemon.registry.loadMap(runtimeconfig.services),
  // };
  // rme.instance.attached = new URL(`/attached/runtime/${rme.slug}`, daemon.config.url,);
  // daemon.runtimes.add(rme);
  // }
}
// console.log(config);
// export async function services(daemon) {
//   for (const serviceconfig of config.services) {
//     const prototype = await daemon.registry.load(serviceconfig.module);
//     const service = new Service(serviceconfig).withPrototype(prototype);
//     daemon.services.add(service);
//   }
// }
