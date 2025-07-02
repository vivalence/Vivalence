import { Application } from "oak";
import config from "@vivalence/config";

import Aperture from "../locals/aperture/index.ts";

import v1 from "./v1/index.js";
import authMiddleware from "./middlewares/auth.js";
import corsMiddleware from "./middlewares/cors.js";
import notFoundMiddleware from "./middlewares/notFound.js";

const contextMiddleware = (daemon) => async (ctx, next) => {
  ctx.daemon = daemon;
  await next();
};

async function init(daemon) {
  daemon.aperture = Aperture.create();

  daemon.aperture.use(contextMiddleware(daemon));

  v1(daemon.aperture.branch("/aperture/v1/daemon"));

  return daemon;
}

async function serve(daemon) {
  const app = new Application();

  app.use(corsMiddleware);
  app.use(authMiddleware);
  app.use(notFoundMiddleware);

  app.use(daemon.aperture.compose());

  daemon.server = app.listen({
    port: parseInt(config.env.get("VIVA_DAEMON_PORT")),
  });

  daemon.call = async (path, body = {}, params = {}) => {
    const ctx = Aperture.context(path, body, params);
    await daemon.aperture.composed(ctx);
    return ctx.response.body;
  };

  return daemon;
}

export default { init, serve };
