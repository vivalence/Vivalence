import { shards } from "@vivalence/typology";

export async function userspace(daemonDie) {
  daemonDie.good.aperture
    .branch("/userspace") //
    .use(shards.secure.authorize())
    .open("/handshake", async (_, ctx) => ({ success: true, user: ctx.user }))
    .open("/entities/:entity/:method", async (input, ctx) => {
      const params = ctx.params;
      if (!input.where) input.where = {};

      if (!["intent", "session"].includes(params.entity)) throw new Error("unsupported entity");
      if (!["find", "findOne", "create"].includes(params.method))
        throw new Error("unsupported method");

      const user = await ctx.user;
      const repository = ctx.daemon.entities[params.entity];

      let result = {};
      switch (params.method) {
        case "find":
          input.where.user = user.id;
          result = await repository.find(input.where, input.options);
          break;
        case "findOne":
          input.where.user = user.id;
          result = await repository.findOne(input.where, input.options);
          break;
        case "create":
          input.where.user = user.id;
          result = await repository.create(input.where);
          await ctx.daemon.entities.em.flush();
          break;
      }
      return result;
    });
}
