import { Daemon, Runtime } from "../../../types/types.d.ts";

export default function serve(daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    if (!runtime.router || !runtime.manifest.url) continue;

    try {
      for (const module of [runtime.domain, runtime.ontology, ...runtime.corpora]) {
        if (!module.router) continue;

        runtime.router.use(
          // ...(module.router.middleware as any[]),
          module.router.routes(),
          module.router.allowedMethods(),
        );
      }

      for (const module of [...runtime.games, ...runtime.tactics, ...runtime.strategies]) {
        if (!module.router || !module.manifest.url) continue;

        runtime.router.use(
          module.manifest.url,
          ...module.router.middleware,
          module.router.routes(),
          module.router.allowedMethods(),
        );
      }

      if (!daemon.router) continue;

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
