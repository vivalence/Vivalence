import { shards } from "@vivalence/vector";

export async function datamap(die) {
  die.good.aperture.open("/entities/:entity/:method", async (body, ctx) => {
    const entity = ctx.runtime.entities[ctx.params.entity];
    return await ctx.runtime.entities.em[ctx.params.method](
      entity.entityName,
      body.where,
      body.options,
    );
  });
}
export async function userspace(die) {
  die.good.aperture
    .branch("/userspace") //
    .open("/status", (body, ctx) => ({
      status: "identity:/status ok",
      timestamp: new Date().toISOString(),
    }))
    .use(shards.secure.authorize())
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

export async function modes(die) {
  die.good.aperture.open("/modes/:type/:method", async (body, ctx) => {
    const params = ctx.params;
    const modes = ctx.runtime.modes[params.type];
    if (!modes) throw new Error("unsupported mode");
    let mode = {};
    switch (params.method) {
      case "findOne":
        mode = modes[body.where.slug];
        break;
      default:
        throw new Error("unsupported method");
    }
    const result = {
      manifest: mode.manifest,
    };
    if (mode.implements("VIEWABLE")) {
      result.view = { url: mode.view.url };
    }
    return result;
    // return await ctx.runtime.modes[someModeManager/EntityMap/RepositorySystem][ctx.params.method](mode.type, body.where, body.options);
  });
}
