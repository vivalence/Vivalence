export default function boot(runtime) {
  for (const module of runtime.config.modules.tactics) {
    const tactic = {
      ...module,
      aperture: runtime.aperture.branch(`/tactic/${module.manifest.slug}`),
      emitter: runtime.emitter.branch(),
    };

    if (module.boot) {
      module.boot({ ...runtime, aperture: tactic.aperture, emitter: tactic.emitter }, tactic);
    } else {
      if (!module.provision) throw new Error("Tactic module must export provision method");
      tactic.aperture.open("/provision", module.provision);
    }

    runtime.modules.tactics[tactic.manifest.slug] = tactic;
  }
}
