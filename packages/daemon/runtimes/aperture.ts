import { Daemon, Runtime } from "@vivalence/types";
import Aperture from "../locals/aperture/index.ts";

const runtimeContextMiddleware = (runtime) => async (ctx, next) => {
  ctx.runtime = runtime;
  await next();
};

function v1(aperture) {
  aperture.open("/status", (body, ctx) => ({
    status: "runtime:/status ok",
    runtime: ctx.runtime.entity.slug,
    timestamp: new Date().toISOString(),
  }));

  // aperture.open("/modules/:module/:repo", async (body, ctx) => {const module = ctx.runtime.domain.modules.get(ctx.params.module); return await ctx.runtime.domain.modules.em[ctx.params.repo](module.type, body.where, body.options,);});
  aperture.open("/entities/:entity/:repo", async (body, ctx) => {
    const entity = ctx.runtime.entities[ctx.params.entity];
    return await ctx.runtime.entities.em[ctx.params.repo](
      entity.entityName,
      body.where,
      body.options,
    );
  });
}

export default {
  init: (daemon: Daemon) => async (runtime: Runtime) => {
    runtime.aperture = daemon.aperture
      .branch(`/aperture/v1/runtime/${runtime.config.manifest.slug}`)
      .use(runtimeContextMiddleware(runtime));

    v1(runtime.aperture);

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
