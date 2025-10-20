// populate is for tools, maps and repositories
import paladin from "@vivalence/paladin";
import { Url, Path, Module } from "@vivalence/typology";
import * as lifecycle from "../runtime/index.js";

export async function registry(daemon) {
  await paladin.vip.mount(new Path(paladin.env.get("VIVA_VIP_MOUNT")));
}
export async function runtimes(daemon) {
  for (const runtimeconfig of paladin.runtimes) {
    const slug = runtimeconfig.manifest.slug;
    const rme = {
      slug,
      path: new Path(`/runtime/${slug}`),
      url: new Url(`/runtime/${slug}`, paladin.daemon.statics.serve),
      instance: new lifecycle.construct.Runtime(runtimeconfig),
      config: runtimeconfig,

      register: {
        // lighthouse: await daemon.registry.load(runtimeconfig.lighthouse),
        // database: await daemon.registry.load(runtimeconfig.database),
        // kernel: await daemon.registry.loadMap(runtimeconfig.modules),
        // modes: await daemon.registry.loadMap(runtimeconfig.modules),
        // services: await daemon.registry.loadMap(runtimeconfig.services),
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
      paladin.daemon.statics.serve,
    );

    daemon.runtimes.add(rme);
  }
}

export async function services(daemon) {
  // for (const runtimepaladin of paladin.runtimes) {
  // const sme = {
  // slug: runtimepaladin.manifest.slug,
  // status: new Status(),
  // connection: new Connection(),
  // path: new Path(`/runtime/${runtimepaladin.manifest.slug}`),
  // url: new URL(`/runtime/${runtimepaladin.manifest.slug}`, daemon.paladin.url,),
  // instance: new lifecycle.Runtime(runtimepaladin),
  // paladin: runtimepaladin,
  // register: await daemon.registry.loadMap(runtimepaladin.services),
  // };
  // rme.instance.attached = new URL(`/attached/runtime/${rme.slug}`, daemon.paladin.url,);
  // daemon.runtimes.add(rme);
  // }
}
// console.log(paladin);
// export async function services(daemon) {
//   for (const servicepaladin of paladin.services) {
//     const prototype = await daemon.registry.load(servicepaladin.module);
//     const service = new Service(servicepaladin).withPrototype(prototype);
//     daemon.services.add(service);
//   }
// }
