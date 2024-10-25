export default async function serve(daemon) {
  for (const [key, runtime] of daemon.runtimes.entries()) {
    try {
      for (const module of [runtime.domain, runtime.ontology, ...runtime.corpora]) {
        runtime.router.use(
          ...module.router.middleware,
          module.router.routes(),
          module.router.allowedMethods(),
        );
      }

      for (const module of [...runtime.games, ...runtime.tactics, ...runtime.strategies]) {
        runtime.router.use(
          module.manifest.url,
          ...module.router.middleware,
          module.router.routes(),
          module.router.allowedMethods(),
        );
      }

      daemon.router.use(
        runtime.manifest.url,
        ...runtime.router.middleware,
        runtime.router.routes(),
        runtime.router.allowedMethods(),
      );

      runtime.call = runtime.router.call.create({ runtime });

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime boot error]", e);
    }
  }

  return daemon;
}
