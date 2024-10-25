import config from "@vivalence/config";

export default function serve(daemon) {
  daemon.app.use(daemon.router.routes());
  daemon.app.use(daemon.router.allowedMethods());

  daemon.server = daemon.app.listen({ port: config.env.DAEMON_PORT });

  console.log(`Router listening  :${config.env.DAEMON_PORT}/*`);
  return daemon;
}
