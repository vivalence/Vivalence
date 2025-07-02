import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { Daemon } from "@vivalence/types";
import { loadServiceClients } from "@vivalence/shared/repository";

import Runtime from "./runtime.ts";
import register from "./register.js";
// import aperture from "./aperture.ts";
// import entities from "./entities.ts";
// import services from "./services.ts";

export default {
  async init(daemon: Daemon) {
    for (const [slug, runtimeconfig] of Object.entries(config.runtimes)) {
      const runtime = new Runtime(runtimeconfig);

      const [domain, modules, services] = await Promise.all([
        registry.load(runtime.config.domain),
        registry.loadMap(runtime.config.modules),
        loadServiceClients(runtime.config.services),
      ]);

      runtime.domain = domain;
      runtime.modules = modules;
      runtime.services = services;

      // console.log(runtime);

      await [
        register,
        //   // entities,
        //   // aperture.init,
        //   // boot,
        //   //
      ]
        .map((fn) => fn(daemon))
        .reduce((acc, fn) => acc.then(fn), Promise.resolve(runtime));

      daemon.runtimes.set(runtime.config.manifest.slug, runtime);
    }
    return daemon;
  },
  async serve(daemon: Daemon) {
    for (const runtime of daemon.runtimes.values()) {
      // console.log(runtime.schema.annotation);
      // await [aperture.serve, install]
      //   .map((fn) => fn(daemon))
      //   .reduce((acc, fn) => acc.then(fn), Promise.resolve(runtime));
    }

    return daemon;
  },
};

function boot(daemon: Daemon) {
  return async (runtime: any) => {
    return await runtime.config.domain.boot(runtime, daemon);
  };
}
function install(daemon: Daemon) {
  return async (runtime: any) => {
    return await runtime.config.domain.install(runtime, daemon);
  };
}
