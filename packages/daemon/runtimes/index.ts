import Repository from "@vivalence/repository";

import Runtime from "./runtime.ts";

import aperture from "./aperture.ts";
import schema from "./schema.ts";

import services from "./services.ts";
import register from "./register.ts";

// import module from "./module.ts";

// import bootHook from "./bootHook.ts";

export default {
  async init(daemon) {
    for (const RuntimeConfig of await Repository.runtimes.load()) {
      // console.log("RuntimeConfig ", RuntimeConfig);

      const runtime = await [
        //
        services,
        schema,
        emitter,
        // register,
        // module,
        // aperture.init,
      ]
        .map((fn) => fn(daemon))
        .reduce((acc, fn) => acc.then(fn), Promise.resolve(new Runtime(RuntimeConfig)));

      // daemon.runtimes.set(runtime.entity.slug, runtime);
    }
    return daemon;
  },
  async serve(daemon) {
    for (const runtime of daemon.runtimes.values()) {
      await [aperture.serve, postBootHook]
        .map((fn) => fn(daemon))
        .reduce((acc, fn) => acc.then(fn), Promise.resolve(runtime));
    }

    return daemon;
  },
};

function postBootHook(daemon: Daemon) {
  return async (runtime: any) => {
    // runtime.statics = runtime.Module.statics;
    return runtime;
  };
}

function emitter(daemon: Daemon) {
  return async (runtime: any) => {
    runtime.emitter = daemon.emitter.branch();
    return runtime;
  };
}
