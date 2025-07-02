import { bundler } from "@vivalence/shared";

export default function boot(runtime) {
  runtime.modules.strategies = {};

  for (const module of runtime.config.modules.strategies) {
    const strategy = {
      ...module,
      aperture: runtime.aperture.branch(`/strategy/${module.manifest.slug}`),
      emitter: runtime.emitter.branch(),
    };
    if (module.boot) {
      const scoped = {
        ...runtime,
        aperture: strategy.aperture,
        emitter: strategy.emitter,
      };
      module.boot(scoped, strategy);
      // TODO: validate module
    } else {
      // if viewable

      if (!strategy.bundle?.path)
        throw new Error(
          "[/learning/boot/strategy.js] Bundle Required",
          strategy,
        );

      const bundle = bundler(strategy.bundle.path);
      bundle.url = bundle.absoluteUrl(strategy.aperture.path);
      bundle.path = strategy.bundle.path;
      strategy.bundle = bundle;

      strategy.aperture.router.get(bundle.get, bundle.serve);

      // if agentic
      // if (module.agent) {strategy.aperture .branch() .use(bundle.injectBundlePath(strategy.aperture.path)) .open("/provision", module.provision);}
    }

    strategy.aperture.open("/get", () => ({
      manifest: strategy.manifest,
      bundle: {
        path: strategy.bundle.path,
        url: strategy.bundle.url.href,
      },
    }));

    strategy.aperture.open("/status", () => ({ status: "strategy ok" }));

    runtime.modules.strategies[strategy.manifest.slug] = strategy;
  }
  return runtime;
}
