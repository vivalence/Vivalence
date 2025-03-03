import config from "@vivalence/config";

export default function serve(daemon) {
  daemon.server.use(daemon.router.routes());
  daemon.server.use(daemon.router.allowedMethods());

  const PORT = config.env.get("VIVA_DAEMON_PORT");
  daemon.server = daemon.server.listen({ port: PORT });

  console.log(`Router listening  :${PORT}/*`);

  return daemon;
}
