export default function boot(runtime) {
  for (const corpus of runtime.register.modules.corpora) {
    if (corpus.boot)
      corpus.boot({
        ...runtime,
        aperture: runtime.aperture.branch(),
        emitter: runtime.emitter.branch(),
      });
  }
  return runtime;
}

// tactics.boot
// games.boot

// export default { ontology, corpora };

// export const defaultModuleBoot: { [key: string]: BootFunction } = {
//   // move to domain?
//   tactic: (runtime: Runtime, tactic: RuntimeModule) => {
//     // assert handlers
//     if (!tactic.Module.provision) {
//       throw new Error("Tactic module must export provision method");
//     }

//     runtime.aperture.open("/provision", tactic.Module.provision);

//     return Promise.resolve(runtime);
//   },

//   game: (runtime: Runtime, game: RuntimeModule) => {
//     // assert handlers
//     const bundle = bundler({
//       entry: game.Module.bundle,
//       serve: game.entity.url,
//     });

//     runtime.aperture.router.get(bundle.url, bundle.serve());

//     // this should be handled elsewhere
//     game.Module.provision &&
//       runtime.aperture
//         .branch()
//         .use(bundle.injectBundleUrl())
//         .open("/provision", game.Module.provision);

//     runtime.aperture.open("/status", () => ({ status: "game ok" }));
//     game.Module.evaluate && runtime.aperture.open("/evaluate", game.Module.evaluate);

//     return Promise.resolve(runtime);
//   },
// };
