export default function serve({ app, runtimes, router }) {
  app.use(router.routes());
  app.use(router.allowedMethods());

  for (const runtime of runtimes.values()) {
    app.use(runtime.router.routes());
    app.use(runtime.router.allowedMethods());
  }

  const port = Deno.env.get("DAEMON_SERVER_PORT");
  const server = app.listen({ port });
  console.log(`Server running on http://localhost:${port}/`);

  return { app, server, runtimes };
}
