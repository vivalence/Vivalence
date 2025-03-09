import Runtime from "./runtime.ts";
import discover from "./discover.js";

import aperture from "./aperture.ts";
import entities from "./entities.ts";
import services from "./services.ts";
import register from "./register.ts";
import module from "./module.ts";
import install from "./install.ts";

export default {
  async init(daemon) {
    for (const RuntimeModule of await discover(daemon)) {
      const runtime = await [entities, register, services, aperture.init, emitter, module, statics]
        .map((fn) => fn(daemon))
        .reduce((acc, fn) => acc.then(fn), Promise.resolve(new Runtime(RuntimeModule)));

      daemon.runtimes.set(runtime.entity.slug, runtime);
    }
    return daemon;
  },
  async serve(daemon) {
    for (const runtime of daemon.runtimes.values()) {
      await [aperture.serve, install]
        .map((fn) => fn(daemon))
        .reduce((acc, fn) => acc.then(fn), Promise.resolve(runtime));
    }

    return daemon;
  },
};

function statics(daemon: Daemon) {
  return async (runtime: any) => {
    runtime.statics = runtime.Module.statics;
    return runtime;
  };
}
function emitter(daemon: Daemon) {
  return async (runtime: any) => {
    runtime.emitter = daemon.emitter.branch();
    return runtime;
  };
}
