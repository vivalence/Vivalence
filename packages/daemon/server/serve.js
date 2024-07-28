import config from "@vivalence/config";

export default function serve({ app, router, ...params }) {
  app.use(router.routes());
  app.use(router.allowedMethods());

  const port = config.env.DAEMON_PORT;
  const server = app.listen({ port });

  console.log(`Router listening on :${port}/*`);

  const abortController = new AbortController();
  return { ...params, router, app, server, abortController };
}
