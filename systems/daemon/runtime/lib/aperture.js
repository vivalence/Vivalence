import { secure, is } from "@vivalence/shared";

export async function datamap(rme) {
  rme.instance.aperture.open("/entities/:entity/:method", async (body, ctx) => {
    const entity = ctx.runtime.entities[ctx.params.entity];
    return await ctx.runtime.entities.em[ctx.params.method](
      entity.entityName,
      body.where,
      body.options,
    );
  });
}

export async function userspace(rme) {
  const runtime = rme.instance;

  const aperture = runtime.aperture.branch("/userspace");

  aperture.open("/status", (body, ctx) => ({
    status: "identity:/status ok",
    timestamp: new Date().toISOString(),
  }));

  aperture
    .use(secure.authorize())
    .open("/handshake", async (_, ctx) => {
      const user = await ctx.identity.getUser();
      return { success: true, user };
    })
    .open("/entities/:entity/:method", async (input, ctx) => {
      const params = ctx.params;
      if (!input.where) input.where = {};

      if (!["intent"].includes(params.entity))
        throw new Error("unsupported entity");
      if (!["find"].includes(params.method))
        throw new Error("unsupported method");

      const user = await ctx.identity.getUser();
      const repository = ctx.runtime.entities[params.entity];

      let result = {};
      switch (params.method) {
        case "find":
          input.where.user = user.id;
          result = await repository.find(input.where, input.options);
      }
      return result;
    });
}

export async function domain(rme) {
  if (is.fn(rme.register.domain.aperture))
    await rme.register.domain.aperture(rme.instance.aperture);
}

export async function modules(rme) {
  // rme.instance.aperture.open("/modules/:type/:method", async (body, ctx) => {
  //   const params = ctx.params;
  //   const modules = ctx.runtime.modules[params.type];
  //   if (!modules) throw new Error("unsupported module");
  //   let module = {};
  //   switch (params.method) {
  //     case "findOne":
  //       module = modules[body.where.slug];
  //       break;
  //     default:
  //       throw new Error("unsupported method");
  //   }
  //   const result = {
  //     manifest: module.manifest,
  //   };
  //   if (module.manifest.traits.includes("VIEWABLE")) {
  //     result.view = { url: module.view.url };
  //   }
  //   return result;
  //   // return await ctx.runtime.modules[someModuleManager/EntityMap/RepositorySystem][ctx.params.method](module.type, body.where, body.options);
  // });
}
