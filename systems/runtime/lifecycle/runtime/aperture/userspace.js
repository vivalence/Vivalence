import { shard, v } from "@vivalence/typology";

const own = (ctx) => ({ user: ctx.user.id });
const viaThread = (ctx) => ({ thread: { user: ctx.user.id } });

export const userspace = async (die, next) => {
  const { entities, twitch, lighthouse } = die.runtime;
  const kernel = die.runtime.datamap.entities;
  const owned = die.aperture.branch("/userspace").use(lighthouse.authenticate).use(lighthouse.bind).branch("/entities");

  const routes = [
    ["terminal", entities.terminal, own, { scope: own, filter: "user" }],
    ["intent", entities.intent, null, {}],
    ["thread", entities.thread, own, {}],
    ["buffer", entities.buffer, viaThread, { scope: own }],
    ["turn", entities.turn, viaThread, { scope: own }],
    ["note", kernel.note, null, { scope: own }],
  ];
  for (const [kind, repository, scope, reactive] of routes) {
    const branch = owned.branch(`/${kind}`);
    if (scope) branch.use(shard.datamap.scope(scope));
    branch.graft(shard.datamap.repository(repository)).graft(shard.datamap.reactive(repository, twitch, reactive));
  }

  const activity = owned
    .branch("/activity")
    .use(shard.datamap.scope(own))
    .graft(shard.datamap.repository(entities.activity, { only: ["find", "findOne", "findOneOrFail", "findAndCount", "count"] }))
    .graft(shard.datamap.reactive(entities.activity, twitch));

  const one = activity.branch("/:id").use(async (ctx, next) => {
    ctx.activity = await entities.activity.findOneOrFail({ id: ctx.params.id, user: ctx.user.id });
    await next();
  });
  one.open({ nature: "stdout", yields: v.primitives.controller.Record }, (ctx) => {
    ctx.output = ctx.activity.stdout(ctx.request.raw?.signal);
  });
  const stdin = one.branch("/stdin");
  for (const name of Object.keys(v.primitives.controller.MACHINE.signals)) {
    stdin.open(name, async (ctx) => {
      await ctx.activity.stdin[name](ctx.input);
      return ctx.activity.controller.toJSON();
    });
  }

  await next();
};
