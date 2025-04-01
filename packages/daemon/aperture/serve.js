import config from "@vivalence/config";
import { Application } from "oak";

import Aperture from "../locals/aperture/index.ts";

import authMiddleware from "./middlewares/auth.js";
import corsMiddleware from "./middlewares/cors.js";

export default async (daemon) => {
  const app = new Application();

  app.use(corsMiddleware);
  app.use(authMiddleware);

  app.use(daemon.aperture.compose());

  daemon.server = app.listen({ port: parseInt(config.env.get("VIVA_DAEMON_PORT")) });

  daemon.call = async (path, body = {}, params = {}) => {
    const ctx = Aperture.context(path, body, params);
    await daemon.aperture.composed(ctx);
    return ctx.response.body;
  };

  return daemon;
};
