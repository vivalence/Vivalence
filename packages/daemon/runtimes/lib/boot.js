import createRouter from "../../server/router/create.js";
import ensure from "./ensure.js";

export default async function boot(Module, runtime) {
  const type = Module.manifest.type.toLowerCase();

  const bus = runtime.bus.scope(`@${type}`);
  const router = createRouter();

  const { manifest } = await ensure(Module, runtime);
  const middlewares = Module.middlewares || [];

  let module = { router, bus, middlewares };
  if (Module.boot) {
    module = (await Module.boot({ ...runtime, ...module }, { manifest, Module })) || module;
  } else {
    switch (Module.manifest.type) {
      case "Tactic":
        if (Module.provision) module.router.route("/", Module.provision);
        else throw new Error("Tactic module must export provision method");
        break;
    }
  }

  return { ...runtime, ...module, manifest, Module };
}
