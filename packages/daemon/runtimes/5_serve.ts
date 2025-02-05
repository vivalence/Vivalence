import { Daemon, Module, Runtime } from "@vivalence/types";

export default function serve(daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    if (!runtime.router || !runtime.entity.url) throw new Error("Cant serve Runtimes");

    try {
      for (const module of [
        runtime.modules.domain,
        runtime.modules.ontology,
        ...(runtime.modules.corpora ?? []),
      ] as Module[]) {
        if (!module.router) continue;

        runtime.router.use(
          ...module.router.middleware,
          module.router.routes(),
          module.router.allowedMethods(),
        );
      }

      for (const module of [...runtime.modules.games, ...runtime.modules.tactics]) {
        //, ...runtime.modules.strategies
        if (!module.router || !module.entity.url) throw new Error("Cant serve modules");

        runtime.router.use(
          module.entity.url,
          ...module.router.middleware,
          module.router.routes(),
          module.router.allowedMethods(),
        );
      }

      daemon.router.use(
        runtime.entity.url,
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
