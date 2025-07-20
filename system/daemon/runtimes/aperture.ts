import { Daemon, Runtime } from "@vivalence/typology/types";

import { secure } from "@vivalence/shared";

import Aperture from "../locals/aperture/index.ts";
import notFoundMiddleware from "../aperture/middlewares/notFound.js";
import { attachIdentity } from "../boot/identity.js";
import { attachServices } from "../boot/services.js";

const runtimeContext = (runtime) => async (ctx, next) => {
  ctx.runtime = runtime;
  await next();
};

function v1(runtime) {
  runtime.aperture.open("/status", async (body, ctx) => ({
    status: "runtime:/status ok",
    user: await ctx.identity.getUser(),
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
  boot: async (daemon: Daemon, runtime: Runtime) => {
    await attachServices(
      runtime.services,
      daemon.aperture //
        .branch(`/attached/services/runtime/${runtime.entity.slug}`),
    );

    runtime.aperture = Aperture.create()
      .use(notFoundMiddleware)
      .use(runtimeContext(runtime));

    attachIdentity(
      runtime.aperture.branch("/identity").use(secure.authorize()),
    );
    v1(runtime);
    await runtime.register.domain.aperture(runtime);

    return runtime;
  },

  serve: async (daemon: Daemon, runtime: Runtime) => {
    const composed = await runtime.aperture.compose(true);

    runtime.call = async (path, body = {}, params = {}) => {
      const ctx = Aperture.context(path, body, params);
      await composed(ctx);
      if (ctx.response.status === 404) console.log("[404]", ctx.request);
      return ctx.response.body;
    };

    daemon.aperture
      .branch(`/runtime/${runtime.entity.slug}`)
      .use(secure.context(runtime.services.identity, runtime.entities.user))
      .use(secure.authorize())
      .descendants.push(runtime.aperture);

    return runtime;
  },
};
