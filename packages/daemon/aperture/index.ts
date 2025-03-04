import config from "@vivalence/config";
import { Application, Router } from "oak";
import Aperture from "../locals/aperture/index.ts";
import authMiddleware from "./middlewares/auth.js";
import corsMiddleware from "./middlewares/cors.js";

const contextMiddleware = (daemon) => async (ctx, next) => {
  // ctx.daemon = daemon;
  // ctx.aperture = daemon.aperture;
  // ctx.services = daemon.services;

  // if (daemon.entities) {
  //   ctx.entities = daemon.entities;
  //   ctx.entities.em = daemon.entities.em.fork();
  // }

  ctx.daemon = daemon;
  await next();
};

const formatContextMiddleware = async (ctx, next) => {
  // translate oak context to aperturecontext;
  await next();
  // and back;
};

export default {
  init: async (daemon) => {
    daemon.aperture = Aperture.create();

    daemon.aperture.use(contextMiddleware(daemon));

    daemon.aperture.open("/status", () => ({
      status: "daemon:/status ok",
      timestamp: new Date().toISOString(),
    }));
    return daemon;
  },

  serve: async (daemon) => {
    const app = new Application();

    app.use(corsMiddleware);
    app.use(authMiddleware);
    app.use(formatContextMiddleware);
    app.use(daemon.aperture.compose());

    daemon.call = async (path, body = {}, params = {}) => {
      const ctx = Aperture.context(path, body, params);
      await daemon.aperture.composed(ctx);
      return ctx.response.body;
    };

    const port = parseInt(config.env.get("VIVA_DAEMON_PORT"));
    daemon.server = app.listen({ port });

    console.log(`Daemon server running on port:${port}`);

    return daemon;
  },
};

// const ctx = {request: {body, url: new URL(path, "http://internal"), method: params.method || "POST", headers: new Headers(),}, response: { body: {}, status: 404, headers: new Headers() },};
// app.use(router.routes()); app.use(router.allowedMethods());
