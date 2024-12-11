import config from "../../../config/src/mod.ts";

export default function serve(daemon) {
  daemon.server.use(daemon.router.routes());
  daemon.server.use(daemon.router.allowedMethods());

  daemon.server = daemon.server.listen({ port: config.env.DAEMON_PORT });

  console.log(`Router listening  :${config.env.DAEMON_PORT}/*`);

  return daemon;
}
