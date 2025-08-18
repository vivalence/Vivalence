import { mw, Vector, parser } from "@vivalence/vector";
import { bundler, secure, is } from "@vivalence/shared";
import { maps } from "@vivalence/entities";

export async function aperture(rme) {
  const runtime = rme.instance;

  if (rme.register.domain.aperture)
    await rme.register.domain.aperture(rme.instance);

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
