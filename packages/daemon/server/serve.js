import config from "@vivalence/config";

export default function serve({ runtimes, app, router, ...params }) {
  for (const { manifest, ...runtime } of runtimes.values()) {
    for (const { manifest, ...game } of runtime.games) {
      runtime.router.use(`/g/${manifest.slug}`, game.router.routes(), game.router.allowedMethods());
    }
    router.use(`/r/${manifest.slug}`, runtime.router.routes(), runtime.router.allowedMethods());
  }

  app.use(router.routes());
  app.use(router.allowedMethods());

  const port = config.env.DAEMON_PORT;
  const server = app.listen({ port });

  console.log(`Router listening on :${port}/*`);

  const abortController = new AbortController();
  return { ...params, router, runtimes, app, server, abortController };
}
