import config from "@vivalence/config";
import { Daemon } from "@vivalence/typology/types";
import { Runtime } from "@vivalence/typology/classes";

import { ensure } from "./register.js";
import register from "./register.js";
import aperture from "./aperture.ts";
import data from "./data.ts";
import identity from "./identity.js";
import attach from "./attach.js";

import services from "../boot/services.js";

export default {
  async boot(daemon: Daemon) {
    for (const runtimeconfig of Object.values(config.runtimes)) {
      const runtime = new Runtime(runtimeconfig);
      runtime.entity = await ensure(daemon.entities.runtime, runtime.manifest);
      await daemon.entities.em.flush();

      // maybe without for now?
      // await register(daemon, runtime);
      runtime.services = await services.managed(runtime.config.services);
      // await daemon.entities.em.flush();

      await identity.boot(runtime);

      // await modules.boot(daemon, runtime);
      await data.boot(daemon, runtime);
      await aperture.boot(daemon, runtime);
      await daemon.entities.em.flush();

      await runtime.register.domain.boot(runtime);
      await attach(daemon, runtime);
      await daemon.entities.em.flush();

      daemon.runtimes.set(runtime.entity.slug, runtime);
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
