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
