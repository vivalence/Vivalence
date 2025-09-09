import { mw, Vector, parser } from "@vivalence/vector";
import { bundler, secure, is } from "@vivalence/shared";
import { maps } from "@vivalence/entities";

export async function aperture(rme) {
  const runtime = rme.instance;

  if (rme.register.domain.aperture)
    await rme.register.domain.aperture(rme.instance);

  runtime.aperture.open("/manifest", async (body, ctx) => ({
    ...ctx.runtime.config.manifest,
  }));

  runtime.aperture.open("/status", async (body, ctx) => ({
    status: "runtime:/status ok",
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

  runtime.aperture.open("/entities/:entity/:method", async (body, ctx) => {
    const entity = ctx.runtime.entities[ctx.params.entity];
    return await ctx.runtime.entities.em[ctx.params.method](
      entity.entityName,
      body.where,
      body.options,
    );
  });
}

export async function expose(rme, daemon) {
  const identity = [...daemon.services]
    .filter(({ runtime }) => runtime === rme.slug)
    .find(({ slug }) => slug === "identity");

  daemon.aperture
    .branch(`/runtime/${rme.slug}`)
    .use(
      secure.context(
        await identity.prototype //
          .client(identity, rme.instance.entities.user),
      ),
    )
    .use(secure.authorize())
    .descendants.push(rme.instance.aperture);
}
