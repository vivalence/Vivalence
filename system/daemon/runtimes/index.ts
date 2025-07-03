import config from "@vivalence/config";
import registry from "@vivalence/registry";
import { Daemon } from "@vivalence/types";
import { Runtime } from "@vivalence/types/classes";

import { loadServiceClients } from "../locals/loadServiceClients.js";

import register from "./register.js";
import aperture from "./aperture.ts";
import entities from "./entities.ts";

export default {
  async init(daemon: Daemon) {
    for (const runtimeconfig of Object.values(config.runtimes)) {
      const runtime = new Runtime(runtimeconfig);

      [runtime.domain, runtime.modules, runtime.services] = await Promise.all([
        registry.load(runtime.config.domain),
        registry.loadMap(runtime.config.modules),
        loadServiceClients(runtime.config.services),
      ]);

      await [register, entities, aperture.init]
        .map((fn) => fn(daemon))
        .reduce((acc, fn) => acc.then(fn), Promise.resolve(runtime));

      await runtime.domain.boot(daemon, runtime);

      daemon.runtimes.set(runtime.entity.slug, runtime);
    }
    return daemon;
  },
  async serve(daemon: Daemon) {
    for (const runtime of daemon.runtimes.values()) {
      // console.log(runtime.schema.annotation);
      // aperture.serve, install
      // return await runtime.config.domain.install(runtime);
    }

    return daemon;
  },
};
