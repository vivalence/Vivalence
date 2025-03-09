import { Daemon, Runtime } from "@vivalence/types";
import Aperture from "../locals/aperture/index.ts";

const runtimeContextMiddleware = (runtime) => async (ctx, next) => {
  ctx.runtime = runtime;
  await next();
};

const entityMiddleware = (runtime) => async (ctx, next) => {
  // for entities and SOMEHOW also update all repository entities.
  //   ctx.runtime.entities.em = runtime.entities.em.fork();

  await next();
};

export default {
  init: (daemon: Daemon) => async (runtime: Runtime) => {
    runtime.aperture = daemon.aperture
      .use(entityMiddleware(runtime))
      // .use(runtimeAuth(runtime))
      // .use(runtimeCall(runtime))
      .branch(runtime.entity.url.pathname)
      .use(runtimeContextMiddleware(runtime));

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

    // console.log("runtime call game status", await runtime.call("/game/flashcards/status"));

    return runtime;
  },
};
