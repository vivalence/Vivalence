import { shard, v } from "@vivalence/typology";

export const userspace = async (die, next) => {
  const branch = die.daemon.aperture.branch("/userspace");
  branch.use(shard.secure.authenticate());
  branch.open("/handshake", async (ctx) => ({ success: true, user: await ctx.identity.enroll() }));

  const owned = branch
    .branch("/entities")
    .use(shard.secure.authorize())
    .use(die.daemon.datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));

  owned
    .branch("/intent")
    .slurp(shard.datamap.repository(die.daemon.entities.intent))
    .slurp(shard.datamap.reactive(die.daemon.entities.intent, die.daemon.twitch));

  owned
    .branch("/thread")
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(die.daemon.entities.thread))
    .slurp(shard.datamap.reactive(die.daemon.entities.thread, die.daemon.twitch));

  owned
    .branch("/buffer")
    .use(shard.datamap.scope((ctx) => ({ thread: { user: ctx.user.id } })))
    .slurp(shard.datamap.repository(die.daemon.entities.buffer))
    .slurp(shard.datamap.reactive(die.daemon.entities.buffer, die.daemon.twitch, { scope: (ctx) => ({ user: ctx.user.id }) }));

  owned
    .branch("/turn")
    .use(shard.datamap.scope((ctx) => ({ thread: { user: ctx.user.id } })))
    .slurp(shard.datamap.repository(die.daemon.entities.turn))
    .slurp(shard.datamap.reactive(die.daemon.entities.turn, die.daemon.twitch, { scope: (ctx) => ({ user: ctx.user.id }) }));

  const activity = owned
    .branch("/activity")
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(die.daemon.entities.activity, { only: ["find", "findOne", "findOneOrFail", "findAndCount", "count"] }))
    .slurp(shard.datamap.reactive(die.daemon.entities.activity, die.daemon.twitch));

  // @beef this code breaks the style pattern.
  // @beef shouldnt one of these be a subscription??
  const one = activity.branch("/:id").use(async (ctx, next) => {
    ctx.activity = await die.daemon.entities.activity.findOneOrFail({ id: ctx.params.id, user: ctx.user.id });
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

  await next();
};
