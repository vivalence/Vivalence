import { Application } from "oak";
import config from "@vivalence/config";

import Aperture from "../locals/aperture/index.ts";

import v1 from "./v1/index.js";
import corsMiddleware from "./middlewares/cors.js";
import notFoundMiddleware from "./middlewares/notFound.js";

const contextMiddleware = (daemon) => async (ctx, next) => {
  ctx.daemon = daemon;
  await next();
};

async function boot(daemon) {
  daemon.aperture = Aperture.create();

  v1(daemon.aperture.branch("/daemon").use(contextMiddleware(daemon)));

  return daemon;
}

async function serve(daemon) {
  const app = new Application();

  app.use(corsMiddleware);
  app.use(notFoundMiddleware);
  app.use(daemon.aperture.compose(true));

  const PORT = parseInt(config.env.get("VIVA_DAEMON_PORT"));
  daemon.server = app.listen({ port: PORT });
  console.log("daemon listening on port:", PORT);

  daemon.call = async (path, body = {}, params = {}) => {
    const ctx = Aperture.context(path, body, params);
    await daemon.aperture.composed(ctx);
    return ctx.response.body;
  };

  return daemon;
}

export default { boot, serve };
