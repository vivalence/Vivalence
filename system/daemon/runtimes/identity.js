import { secure } from "@vivalence/shared";

export function boot(runtime) {
  const aperture = runtime.aperture.branch("/identity");

  aperture.open("/status", (body, ctx) => ({
    status: "identity:/status ok",
    timestamp: new Date().toISOString(),
  }));

  aperture
    .branch("/shard")
    .use(secure.authorize())
    .open("/handshake", async (_, ctx) => {
      const user = await ctx.identity.getUser();
      // console.log("user", user);
      return { success: true };
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

export default { boot };
