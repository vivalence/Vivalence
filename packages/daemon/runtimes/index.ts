import { Daemon } from "@vivalence/types";
import Repository from "@vivalence/repository";

import Runtime from "./runtime.ts";

import aperture from "./aperture.ts";
import schema from "./schema.ts";
import services from "./services.ts";

// import boot from "./boot.ts";
// import bootHook from "./bootHook.ts";

export default {
  async init(daemon: Daemon) {
    for (const RuntimeConfig of await Repository.runtimes.load()) {
      const runtime = await [
        emitter,
        services,
        schema,
        aperture.init,
        boot,
        //
      ]
        .map((fn) => fn(daemon))
        .reduce((acc, fn) => acc.then(fn), Promise.resolve(new Runtime(RuntimeConfig)));

      daemon.runtimes.set(runtime.config.manifest.slug, runtime);
    }
    return daemon;
  },
  async serve(daemon: Daemon) {
    for (const runtime of daemon.runtimes.values()) {
      await [aperture.serve] //postServeHook
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

function emitter(daemon: Daemon) {
  return async (runtime: any) => {
    runtime.emitter = daemon.emitter.branch();
    return runtime;
  };
}
