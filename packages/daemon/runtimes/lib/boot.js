import createRouter from "../../server/router/create.js";
import ensure from "./ensure.js";
import middlewares from "../middlewares/index.js";

const defaultModuleBoot = {
  tactic: async (module, Module) => {
    if (!Module.provision) throw new Error("Tactic module must export provision method");
    module.router.route("/", Module.provision);
    return module;
  },
};

async function boot(Module, runtime) {
  const type = Module.manifest.type.toLowerCase();
  const bootable = Module.boot || defaultModuleBoot[type];
  if (!bootable) throw new Error(`${type} Module unbootable: ${Module.manifest.slug}`);

  let moduleRuntime = {
    ["#symbol"]: runtime["#symbol"],
    manifest: runtime.manifest,
    Module: runtime.Module,
    locals: runtime.locals,
    services: runtime.services,
    statics: runtime.statics,
    router: createRouter(),
    bus: runtime.bus.scope(`@${type}`),
  };

  if (middlewares[type]) moduleRuntime.router.middleware.push(...middlewares[type]);

  const manifest = await ensure(Module, runtime);
  const module = (await bootable(moduleRuntime, { ...Module, manifest })) || moduleRuntime;

  return { ...module, manifest, Module };
}

boot.many = async (Modules, runtime) => {
  const booted = await Promise.all(Modules.values().map((M) => boot(M, runtime)));
  return new Map(booted.map((m) => [m.manifest.slug, m]));
};

export default boot;
