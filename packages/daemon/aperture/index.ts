import { Application, Router } from "oak";
import { compose } from "oak/middleware";
import Aperture from "../locals/aperture/index.ts";
import authMiddleware from "../middlewares/auth.ts";
import corsMiddleware from "../middlewares/cors.ts";

const contextMiddleware = (daemon) => async (ctx, next) => {
  ctx.daemon = daemon;
  ctx.aperture = daemon.aperture;
  ctx.services = daemon.services;

  if (daemon.entities) {
    ctx.entities = daemon.entities;
    ctx.entities.em = daemon.entities.em.fork();
  }

  await next();
  ctx.daemon = daemon;
};

const formatContextMiddleware = async (ctx, next) => {
  // translate oak context to aperturecontext;
  await next();
  // and back;
};

export default {
  init: async (daemon) => {
    // Create the root aperture instance
    daemon.aperture = Aperture.create({});

    // Apply core middlewares in correct order
    daemon.aperture.use(contextMiddleware(daemon));

    // Add status endpoint
    daemon.aperture.open("/status", () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    }));

    return daemon;
  },

  serve: async (daemon) => {
    const app = new Application();
    // const router = new Router();

    app.use(corsMiddleware);
    app.use(authMiddleware);
    app.use(formatContextMiddleware);
    app.use(daemon.aperture.compose());
    // app.use(router.routes()); app.use(router.allowedMethods());

    daemon.call = async (path, body = {}, params = {}) => {
      const ctx = {
        request: {
          body,
          url: new URL(path, "http://internal"),
          method: params.method || "POST",
          headers: new Headers(),
        },
        response: { body: {}, status: 404, headers: new Headers() },
      };

      await daemon.aperture.composed(ctx);

      return ctx.response.body;
    };

    const port = parseInt(Deno.env.get("PORT") || "8080");
    daemon.server = await app.listen({ port });
    console.log(`Daemon server running on port ${port}`);

    return daemon;
  },
};
