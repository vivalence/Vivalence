import { Daemon, Runtime } from "@vivalence/types";
import { Application, Router } from "oak";
import { Router } from "oak";
import Aperture from "../locals/aperture/index.ts";
// import {} from "../lib/aperture/index.ts";

const runtimeContextMiddleware = (runtime) => async (ctx, next) => {
  ctx.runtime = runtime;

  // const daemonCall = ctx.aperture?.call;

  // ctx.aperture.call = async (path, body = {}, params = {}) => {
  //   const runtimePath = path.startsWith("/") ? `/runtime${path}` : `/runtime/${path}`;
  //   const runtimeBody = typeof body === "object" ? { ...body, runtime: runtime.id } : body;
  //   return await daemonCall(runtimePath, runtimeBody, params);
  // };

  await next();
};

const entityMiddleware = (runtime) => async (ctx, next) => {
  // Override entity manager with runtime-specific one if available
  if (runtime.entities) {
    ctx.entities = runtime.entities;
    ctx.entities.em = runtime.entities.em.fork();
  }

  await next();
};

export default {
  init: (daemon: Daemon) => async (runtime: Runtime) => {
    runtime.aperture = daemon.aperture.branch(runtime.entity.url.pathname);

    // runtime.aperture.use(runtimeContextMiddleware(runtime));
    // runtime.aperture.use(entityMiddleware(runtime));

    runtime.aperture.open("/status", (ctx) => ({
      status: "runtime:/status ok",
      timestamp: new Date().toISOString(),
    }));

    return runtime;
  },

  serve: (daemon: Daemon) => async (runtime: Runtime) => {
    await runtime.aperture.compose();

    runtime.call = async (path, body = {}, params = {}) => {
      const ctx = Aperture.context(path, body, params);
      await runtime.aperture.composed(ctx);
      return ctx.response.body;
    };

    return runtime;
  },
};
