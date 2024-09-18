import config from "@vivalence/config";

export default function serve({ app, router, runtimes, ...params }) {
  app.use(router.routes());
  app.use(router.allowedMethods());

  const port = config.env.DAEMON_PORT;
  const server = app.listen({ port });

  for (const runtime of runtimes.values()) {
    // mw maybe?
    runtime.call = runtime.caller();
  }

  console.log(`Router listening on :${port}/*`);

  const abortController = new AbortController();
  return { ...params, runtimes, router, app, server, abortController };
}
