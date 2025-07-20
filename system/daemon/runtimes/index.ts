import config from "@vivalence/config";
import { Daemon } from "@vivalence/typology/types";
import { Runtime } from "@vivalence/typology/classes";

import register from "./register.js";
import aperture from "./aperture.ts";
import data from "./data.ts";

import { ensure } from "./register.js";
import { loadServiceClients } from "../boot/services.js";
import emitter from "../locals/emitter/index.js";

export default {
  async boot(daemon: Daemon) {
    for (const runtimeconfig of Object.values(config.runtimes)) {
      const runtime = new Runtime(runtimeconfig);

      runtime.entity = await ensure(daemon.entities.runtime, runtime.manifest);
      runtime.emitter = emitter.create();
      runtime.services = await loadServiceClients(runtime.config.services);

      await register(daemon, runtime);
      await data(daemon, runtime);
      await aperture.boot(daemon, runtime);
      await runtime.register.domain.boot(runtime);

      daemon.runtimes.set(runtime.entity.slug, runtime);
      await daemon.entities.em.flush();
    }
    return daemon;
  },
  async serve(daemon: Daemon) {
    for (const runtime of daemon.runtimes.values()) {
      await aperture.serve(daemon, runtime);
    }

    return daemon;
  },
  async install(daemon: Daemon) {
    for (const runtime of daemon.runtimes.values()) {
      await runtime.register.domain.install(runtime);
    }

    return daemon;
  },
};
