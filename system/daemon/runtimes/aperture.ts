import { Daemon, Runtime } from "@vivalence/types";

import Aperture from "../locals/aperture/index.ts";
import notFoundMiddleware from "../aperture/middlewares/notFound.js";

const runtimeContext = (runtime) => async (ctx, next) => {
  ctx.runtime = runtime;

  const token = ctx.request.auth.token;
  const repository = runtime.entitites.user;

  ctx.identity = await runtime.services.identity //
    .authenticate(token, repository);

  await next();
};

function v1(runtime) {
  runtime.aperture.open("/status", (body, ctx) => ({
    status: "runtime:/status ok",
    runtime: ctx.runtime.config.manifest.slug,
    timestamp: new Date().toISOString(),
  }));

  runtime.aperture.open("/modules/:module/:method", async (body, ctx) => {
    const params = ctx.params;

    if (!["game", "strategy", "tactic"].includes(params.module))
      throw new Error("unsupported module");
    if (!["findOne"].includes(params.method))
      throw new Error("unsupported method");

    const modules =
      ctx.runtime.modules[
        {
          tactic: "tactics",
          game: "games",
          strategy: "strategies",
        }[params.module]
      ];

    let module = {};
    switch (params.method) {
      case "findOne":
        module = modules[body.where.slug];
      // if (module.manifest.traits.includes("VIEWABLE")) module.bundle = modules[body.slug].bundle;
    }

    const result = {
      manifest: module.manifest,
    };
    if (module.bundle) {
      result.bundle = {
        path: module.bundle.path,
        url: module.bundle.url.href,
      };
    }
    return result;
    // return await ctx.runtime.modules[someModuleManager/EntityMap/RepositorySystem][ctx.params.method](module.type, body.where, body.options);
  });

  // .use(import secure() from "@vivalence/shared")
  // .use(runtime.services.identity.secure())
  runtime.aperture.open("/entities/:entity/:repo", async (body, ctx) => {
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
      .branch(`/aperture/v1/runtime/${runtime.entity.slug}`)
      .use(notFoundMiddleware)
      .use(runtimeContext(runtime));

    v1(runtime);

    return runtime;
  },

  serve: (daemon: Daemon) => async (runtime: Runtime) => {
    await runtime.aperture.compose();

    runtime.call = async (path, body = {}, params = {}) => {
      const ctx = Aperture.context(path, body, params);
      await runtime.aperture.composed(ctx);
      if (ctx.response.status === 404) console.log("[404]", ctx.request);
      return ctx.response.body;
    };

    return runtime;
  },
};
