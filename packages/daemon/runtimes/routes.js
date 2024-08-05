export default function serve({ runtimes, router, ...params }) {
  for (const { manifest, ...runtime } of runtimes.values()) {
    for (const module of [runtime.domain, runtime.ontology, runtime.corpus]) {
      runtime.router.use(module.router.routes(), module.router.allowedMethods());
    }

    for (const { manifest, ...game } of runtime.games) {
      runtime.router.use(`/g/${manifest.slug}`, game.router.routes(), game.router.allowedMethods());
    }

    router.use(`/r/${manifest.slug}`, runtime.router.routes(), runtime.router.allowedMethods());

    // console.log(`[RUNTIME] /r/${manifest.slug}`);
  }
  return { ...params, router, runtimes };
}
