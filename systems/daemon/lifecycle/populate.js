import config from "@vivalence/config";
import { maps } from "@vivalence/entities";
import { Path } from "@vivalence/typology";
import * as lifecycle from "../runtime/index.js";
import * as lib from "../runtime/lib/index.js";

export async function runtimes(daemon) {
  for (const runtimeconfig of config.runtimes) {
    const rme = {
      slug: runtimeconfig.manifest.slug,
      path: new Path(`/runtime/${runtimeconfig.manifest.slug}`),
      url: new URL(
        `/runtime/${runtimeconfig.manifest.slug}`,
        daemon.config.url,
      ),
      instance: new lifecycle.Runtime(runtimeconfig),
      config: runtimeconfig,

      register: {
        domain: await daemon.registry.load(runtimeconfig.domain),
        ontology: await daemon.registry.load(runtimeconfig.ontology),
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

    rme.maps.modules = {
      // defaults? ...typology.maps.modules
      ...(rme.register.domain.maps.modules || {}),
    };

    rme.maps.traits = {
      ...lib.modules.traitmap,
      ...(rme.register.domain.maps.traits || {}),
    };

    rme.maps.entities = {
      valence: maps.system.valence,
      module: maps.system.module,
      ...maps.userspace,
      ...rme.register.domain.maps.entities,
      // ...maps.ontology,
    };

    rme.instance.attached = new URL(
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
