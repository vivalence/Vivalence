export default async function boot(runtime) {
  runtime.modules.tactic = {};

  for (const module of runtime.register.modules.tactics) {
    const tactic = {
      ...module,
      aperture: runtime.aperture.branch(`/tactic/${module.manifest.slug}`),
      // emitter: runtime.emitter.branch(),
    };

    tactic.aperture.use(async (ctx, next) => {
      ctx.tactic = tactic;
      return await next();
    });

    if (module.boot) {
      await module.boot(
        {
          ...runtime,
          aperture: tactic.aperture,
          // emitter: tactic.emitter,
        },
        tactic,
      );
    } else {
      if (!module.provision)
        throw new Error("Tactic module must export provision method");
      tactic.aperture.open("/provision", module.provision);
    }

    tactic.aperture.open("/get", () => ({ manifest: tactic.manifest }));
    tactic.aperture.open("/status", () => ({ status: "tactic ok" }));

    runtime.modules.tactic[tactic.manifest.slug] = tactic;
  }
  return runtime;
}
