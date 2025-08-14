import config from "@vivalence/config";
import { Daemon, Runtime } from "@vivalence/typology/types";
import { secure } from "@vivalence/shared";

import Aperture from "../locals/aperture/index.ts";
import notFoundMiddleware from "../aperture/middlewares/notFound.js";
import { inject } from "./lib.js";

function v1(runtime) {
  runtime.aperture.open("/status", async (body, ctx) => ({
    status: "runtime:/status ok",
    // user: await ctx.identity.getUser(),
    runtime: ctx.runtime.config.manifest.slug,
    timestamp: new Date().toISOString(),
  }));

  runtime.aperture.open("/modules/:module/:method", async (body, ctx) => {
    const params = ctx.params;

    const modules = ctx.runtime.modules[params.module];
    if (!modules) throw new Error("unsupported module");

    let module = {};
    switch (params.method) {
      case "findOne":
        module = modules[body.where.slug];
        break;
      default:
        throw new Error("unsupported method");
    }

    const result = {
      manifest: module.manifest,
    };

    if (module.manifest.traits.includes("VIEWABLE")) {
      result.view = { url: module.view.url };
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
    runtime.aperture = Aperture.create()
      .use(notFoundMiddleware)
      .use(inject(runtime));

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
