import { shard, v } from "@vivalence/typology";

export async function userspace(daemonDie) {
  const { entities, twitch } = daemonDie.good;
  const branch = daemonDie.good.aperture.branch("/userspace");
  branch.use(shard.secure.authenticate());
  branch.open("/handshake", async (ctx) => ({ success: true, user: await ctx.identity.enroll() }));

  const owned = branch
    .branch("/entities")
    .use(shard.secure.authorize())
    .use(daemonDie.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));

  owned
    .branch("/intent")
    .slurp(shard.datamap.repository(entities.intent))
    .slurp(shard.datamap.reactive(entities.intent, twitch));

  owned
    .branch("/thread")
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(entities.thread))
    .slurp(shard.datamap.reactive(entities.thread, twitch));

  owned
    .branch("/buffer")
    .use(shard.datamap.scope((ctx) => ({ thread: { user: ctx.user.id } })))
    .slurp(shard.datamap.repository(entities.buffer))
    .slurp(
      shard.datamap.reactive(entities.buffer, twitch, { scope: (ctx) => ({ user: ctx.user.id }) }),
    );

  owned
    .branch("/turn")
    .use(shard.datamap.scope((ctx) => ({ thread: { user: ctx.user.id } })))
    .slurp(shard.datamap.repository(entities.turn))
    .slurp(
      shard.datamap.reactive(entities.turn, twitch, { scope: (ctx) => ({ user: ctx.user.id }) }),
    );

  const activity = owned
    .branch("/activity")
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(
      shard.datamap.repository(entities.activity, {
        only: ["find", "findOne", "findOneOrFail", "findAndCount", "count"],
      }),
    )
    .slurp(shard.datamap.reactive(entities.activity, twitch));

  // @beef this code breaks the style pattern.
  // @beef shouldnt one of these be a subscription??
  const one = activity.branch("/:id").use(async (ctx, next) => {
    ctx.activity = await entities.activity.findOneOrFail({ id: ctx.params.id, user: ctx.user.id });
    await next();
  });
  one.open({ nature: "stdout", yields: v.primitives.controller.Record }, (ctx) => {
    ctx.output = ctx.activity.stdout(ctx.request.raw?.signal);
  });
  const stdin = one.branch("/stdin");
  for (const name of Object.keys(v.primitives.controller.MACHINE.signals))
    stdin.open(name, async (ctx) => {
      await ctx.activity.stdin[name](ctx.input);
      return ctx.activity.controller.toJSON();
    });
  // @beef this code breaks the style pattern.
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
