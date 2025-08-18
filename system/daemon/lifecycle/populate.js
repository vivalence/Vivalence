import { Service, Runtime } from "@vivalence/typology/prototypes";
import { mw } from "@vivalence/vector";
import config from "@vivalence/config";

export async function services(daemon) {
  for (const serviceconfig of config.services) {
    const service = new Service().withConfig(serviceconfig);
    service.prototype = await daemon.registry.load(serviceconfig.module);
    daemon.services.add(service);
  }
}

export async function runtimes(daemon) {
  for (const runtimeconfig of config.runtimes) {
    const register = await daemon.registry //
      .loadMap(runtimeconfig.register);

    const instance = new Runtime().withConfig(runtimeconfig);

    const ontology = instance.ontology;
    for (const topology of [
      register.ontology.topology,
      ...register.topic.map((t) => t.topology),
    ]) {
      if (topology.dimensions)
        topology.dimensions //
          .map((d) => ontology.dimension.create(d));

      if (topology.topographies) {
        topology.topographies //
          .map((t) => ontology.topography.create(t));
      }

      if (topology.constraints)
        topology.constraints //
          .map((c) => ontology.constraint.create(c));

      if (topology.remedies)
        topology.remedies.map((r) => ontology.medic.register(r));

      if (topology.receptors) {
        topology.receptors.entries().forEach(([form, parsers]) => {
          parsers.map((parser) => ontology.taxonomist.on(form, parser));
        });
      }
    }

    for (const service of daemon.services) {
      if (service.runtime === instance.slug) {
        if (["database", "identity"].includes(service.slug)) continue;
        service.client = await service.prototype.client(service);
        instance.services[service.slug] = service.client;
      }
    }

    Object.keys(register.domain.modules.map).map(
      (type) => (instance.domain.modulemap[type] = []),
    );
    Object.keys(register.domain.modules.map).map(
      (type) => (instance.modules[type] = {}),
    );

    const rme = {
      // runtime map entry
      slug: instance.slug,
      instance,
      register,
      config: runtimeconfig,
    };

    daemon.runtimes.add(rme);
  }
}
