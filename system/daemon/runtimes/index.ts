import config from "@vivalence/config";
import { Daemon } from "@vivalence/typology/types";
import { Runtime } from "@vivalence/typology/classes";
import registry from "@vivalence/registry";

import aperture from "./aperture.ts";
import data from "./data.ts";
import shard from "./shard.js";
import attach from "./attach.js";

import services from "../boot/services.js";

export default {
  async boot(daemon: Daemon) {
    for (const runtimeconfig of Object.values(config.runtimes)) {
      const runtime = new Runtime(runtimeconfig);

      runtime.services = await services.managed(runtime.config.services);
      runtime.register = await registry.loadMap(runtime.config.register);

      await data.boot(daemon, runtime);
      await aperture.boot(daemon, runtime);
      await shard.boot(runtime);

      // await runtime.register.domain.boot(runtime);
      await attach(daemon, runtime);
      // await daemon.entities.em.flush();

      daemon.runtimes.set(runtime.manifest.slug, runtime);
    }
    return daemon;
  },
  async serve(daemon: Daemon) {
    for (const runtime of daemon.runtimes.values()) {
      await aperture.serve(daemon, runtime);
      await data.serve(daemon, runtime);
    }

    return daemon;
  },
  async install(daemon: Daemon) {
    for (const runtime of daemon.runtimes.values()) {
      await runtime.register.domain.install(runtime);
      await daemon.entities.em.flush();
    }

    return daemon;
  },
};
