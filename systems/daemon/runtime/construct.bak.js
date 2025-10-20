import paladin from "@vivalence/paladin";
import { Url, Path, Module } from "@vivalence/typology";

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
