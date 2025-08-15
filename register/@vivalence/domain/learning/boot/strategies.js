import { bundler } from "@vivalence/shared";

export default function boot(runtime) {
  runtime.modules.strategy = {};

  for (const module of runtime.register.modules.strategies) {
    const aperture = runtime.aperture
      .branch(`/strategy/${module.manifest.slug}`)
      .use(async (ctx, next) => {
        ctx.module = strategy;
        return await next();
      });

    const strategy = { ...module, aperture };

    if (strategy.boot) {
      strategy.boot(runtime, strategy);
      delete strategy.boot;
    }

    strategy.aperture.open("/status", () => ({
      status: "strategy ok",
      manifest: strategy.manifest,
    }));

    runtime.modules.strategy[strategy.manifest.slug] = strategy;
    // TODO @daemon: validate module
    // TODO @runtime: strategy.view = runtime.attachments.views.register(strategy)
  }
  return runtime;
}

// const scoped = {...runtime, aperture: strategy.aperture, emitter: strategy.emitter,};
// else {} if (!strategy.bundle?.path) throw new Error("[/learning/boot/strategy.js] Bundle Required", strategy,); const bundle = bundler(strategy.bundle.path); bundle.url = bundle.absoluteUrl(strategy.aperture.path); bundle.path = strategy.bundle.path; console.log(strategy.bundle, bundle); strategy.bundle = bundle; strategy.aperture.router.get(bundle.get, bundle.serve); if (module.agent) {strategy.aperture .branch() .use(bundle.injectBundlePath(strategy.aperture.path)) .open("/provision", module.provision);}
