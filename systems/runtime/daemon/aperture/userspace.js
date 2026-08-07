import { shard } from "@vivalence/typology";

export async function userspace(daemonDie) {
  const { entities } = daemonDie.good;
  const branch = daemonDie.good.aperture.branch("/userspace");
  branch.use(shard.secure.authorize());

  branch
    .branch("/entities/intent")
    .slurp(shard.datamap.repository(entities.intent))
    .slurp(shard.datamap.reactive(entities.intent, daemonDie.good.twitch));

  branch
    .branch("/entities/thread")
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(entities.thread))
    .slurp(shard.datamap.reactive(entities.thread, daemonDie.good.twitch));

  branch
    .branch("/entities/buffer")
    .use(shard.datamap.scope((ctx) => ({ thread: { user: ctx.user.id } })))
    .slurp(shard.datamap.repository(entities.buffer))
    .slurp(
      shard.datamap.reactive(entities.buffer, daemonDie.good.twitch, {
        scope: (ctx) => ({ user: ctx.user.id }),
      }),
    );

  branch
    .branch("/entities/turn")
    .use(shard.datamap.scope((ctx) => ({ thread: { user: ctx.user.id } })))
    .slurp(shard.datamap.repository(entities.turn))
    .slurp(
      shard.datamap.reactive(entities.turn, daemonDie.good.twitch, {
        scope: (ctx) => ({ user: ctx.user.id }),
      }),
    );

  branch.open("/handshake", async (ctx) => ({ success: true, user: ctx.user }));
}

// import { shards } from "@vivalence/typology";
//
// export async function userspace(daemonDie) {
//   daemonDie.good.aperture
//     .branch("/userspace") //
//     .use(shards.secure.authorize())
//     .open("/handshake", async (_, ctx) => ({ success: true, user: ctx.user }))
//     .open("/entities/:entity/:method", async (input, ctx) => {
//       const params = ctx.params;
//       if (!input.where) input.where = {};
//
//       if (!["intent", "thread"].includes(params.entity)) throw new Error("unsupported entity");
//       if (!["find", "findOne", "create"].includes(params.method))
//         throw new Error("unsupported method");
//
//       const user = await ctx.user;
//       const repository = ctx.daemon.entities[params.entity];
//
//       let result = {};
//       switch (params.method) {
//         case "find":
//           input.where.user = user.id;
//           result = await repository.find(input.where, input.options);
//           break;
//         case "findOne":
//           input.where.user = user.id;
//           result = await repository.findOne(input.where, input.options);
//           break;
//         case "create":
//           input.where.user = user.id;
//           result = await repository.create(input.where);
//           await ctx.daemon.entities.em.flush();
//           break;
//       }
//       return result;
//     });
// }
