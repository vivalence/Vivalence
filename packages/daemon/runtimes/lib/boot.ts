import { BootFunction, Runtime, RuntimeModule } from "@vivalence/types";
import { bundler } from "@vivalence/shared";

export async function bootModule(module: RuntimeModule, runtime: Runtime) {
  const scopedModuleRuntime = { ...runtime, router: module.router, bus: module.bus };

  const boot = module.Module.boot ?? defaultModuleBoot[module.Module.manifest.type];

  if (!boot) return { ...scopedModuleRuntime, entity: module.entity, Module: module.Module };

  const bootedModule = await boot(scopedModuleRuntime, module);

  if (!bootedModule) {
    throw new Error(
      `Boot method for ${module.Module.manifest.type ?? "runtime"}:${module.entity.slug} must return runtime`,
    );
  }

  return { ...bootedModule, entity: module.entity, Module: module.Module };
}

export async function bootModules(modules: RuntimeModule[], runtime: Runtime) {
  if (!modules) return [];

  return await Promise.all(modules.map(async (module) => await bootModule(runtime, module)));
}

export const defaultModuleBoot: { [key: string]: BootFunction } = {
  runtime: (runtime: Runtime) => Promise.resolve(runtime),

  tactic: (runtime: Runtime, tactic: RuntimeModule) => {
    // assert handlers
    if (!tactic.Module.provision) {
      throw new Error("Tactic module must export provision method");
    }

    runtime.router?.route("/provision", tactic.Module.provision);

    return Promise.resolve(runtime);
  },

  game: (runtime: Runtime, game: RuntimeModule) => {
    // assert handlers
    const bundle = bundler({
      entry: game.Module.bundle,
      serve: game.entity.url,
    });

    runtime.router.get(bundle.url, bundle.serve());

    // this should be handled by domain middlewares
    game.Module.provision &&
      runtime.router.route("/provision", bundle.injectBundleUrl(), game.Module.provision);
    game.Module.evaluate && runtime.router.route("/evaluate", game.Module.evaluate);

    return Promise.resolve(runtime);
  },
};

type DefaultModuleBoot = typeof defaultModuleBoot;
