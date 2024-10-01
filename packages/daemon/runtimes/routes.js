export default function serve({ runtimes, router, ...params }) {
  for (const { manifest, ...runtime } of runtimes.values()) {
    for (const module of [runtime.domain, runtime.ontology, ...runtime.corpora.values()]) {
      runtime.router.use(
        ...module.router.middleware,
        module.router.routes(),
        module.router.allowedMethods(),
      );
    }

    for (const { manifest, ...game } of runtime.games.values()) {
      runtime.router.use(
        `/g/${manifest.slug}`,
        ...game.router.middleware,
        game.router.routes(),
        game.router.allowedMethods(),
      );
    }

    for (const { manifest, ...tactic } of runtime.tactics.values()) {
      // console.log(`[RUNTIME] /t/${manifest.slug}`);
      runtime.router.use(
        `/t/${manifest.slug}`,
        ...tactic.router.middleware,
        tactic.router.routes(),
        tactic.router.allowedMethods(),
      );
    }

    router.use(
      `/r/${manifest.slug}`,
      ...runtime.router.middleware,
      runtime.router.routes(),
      runtime.router.allowedMethods(),
    );

    console.log(`[RUNTIME] /r/${manifest.slug}`);
  }
  return { ...params, router, runtimes };
}
