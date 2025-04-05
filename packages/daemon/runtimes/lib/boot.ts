import { BootFunction, Runtime, RuntimeModule } from "@vivalence/types";
import { bundler } from "@vivalence/shared";

export async function bootModule(module: RuntimeModule, runtime: Runtime) {
  const scopedModuleRuntime = { ...runtime, aperture: module.aperture, emitter: module.emitter };

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

  return await Promise.all(modules.map(async (module) => await bootModule(module, runtime)));
}

// move to domain and read from runtime.domain.boot
export const defaultModuleBoot: { [key: string]: BootFunction } = {
  // move to domain?
  tactic: (runtime: Runtime, tactic: RuntimeModule) => {
    // assert handlers
    if (!tactic.Module.provision) {
      throw new Error("Tactic module must export provision method");
    }

    runtime.aperture.open("/provision", tactic.Module.provision);

    return Promise.resolve(runtime);
  },

  game: (runtime: Runtime, game: RuntimeModule) => {
    // assert handlers
    const bundle = bundler({
      entry: game.Module.bundle,
      serve: game.entity.url,
    });

    runtime.aperture.router.get(bundle.url, bundle.serve());

    // this should be handled elsewhere
    game.Module.provision &&
      runtime.aperture
        .branch()
        .use(bundle.injectBundleUrl())
        .open("/provision", game.Module.provision);

    runtime.aperture.open("/status", () => ({ status: "game ok" }));
    game.Module.evaluate && runtime.aperture.open("/evaluate", game.Module.evaluate);

    return Promise.resolve(runtime);
  },
};

type DefaultModuleBoot = typeof defaultModuleBoot;
