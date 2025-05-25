import { Daemon } from "@vivalence/types";
import Repository from "@vivalence/repository";

import Runtime from "./runtime.ts";

import register from "./register.js";
import install from "./install.ts";
import aperture from "./aperture.ts";
import entities from "./entities.ts";
import services from "./services.ts";

export default {
  async init(daemon: Daemon) {
    for (const RuntimeConfig of await Repository.runtimes.load()) {
      const runtime = await [
        register,
        services,
        entities,
        aperture.init,
        boot,
        //
      ]
        .map((fn) => fn(daemon))
        .reduce(
          (acc, fn) => acc.then(fn),
          Promise.resolve(new Runtime(RuntimeConfig, daemon)),
        );

      daemon.runtimes.set(runtime.config.manifest.slug, runtime);
    }
    return daemon;
  },
  async serve(daemon: Daemon) {
    for (const runtime of daemon.runtimes.values()) {
      await [aperture.serve, install]
        .map((fn) => fn(daemon))
        .reduce((acc, fn) => acc.then(fn), Promise.resolve(runtime));
    }

    return daemon;
  },
};

function boot(daemon: Daemon) {
  return async (runtime: any) => {
    return (await runtime.config.domain.boot(runtime)) || runtime;
  };
}
