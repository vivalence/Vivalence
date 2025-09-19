import { secure, is } from "@vivalence/shared";

export async function identity(rme) {
  const runtime = rme.instance;

  const aperture = runtime.aperture.branch("/identity");

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

// console.log("user", user);
// const intent = ctx.runtime.entities.intent.create({
//   user,
//   traits: ["RESOLVED"],
//   data: {
//     RESOLVED: {
//       path: "/strategy/eva",
//     },
//   },
// });
// await ctx.runtime.entities.em.flush();
// console.log(intent);
