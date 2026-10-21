import paladin from "@vivalence/paladin";
import { fromm, Path, shard, shape, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";
import { host } from "../../../gestalten/shard/index.js";

export const prune = async (die, next) => {
  await belt.modes.prune(die.runtime);
  await next();
};

export const ledger = async (die, next) => {
  const log = paladin.ledger.log(die.runtime.instance.manifest.slug);
  die.controller.stdout.pipe.tap((record) => log.append({ json: record }));
  await next();
};

export const patrol = async (die, next) => {
  const beat = setInterval(
    async () =>
      die.controller.stdout.log({
        service: Object.fromEntries(Object.values(die.runtime.services).map((service) => [service.slug, service.controller.status.reflection.code])),
        daemon: Object.fromEntries(Object.values(die.runtime.daemons).map((daemon) => [daemon.slug, daemon.controller.status.reflection.code])),
        files: await die.runtime.datamap.shard.scope(() => die.runtime.entities.file.sweep()),
      }),
    60000,
  );
  try {
    await next();
  } finally {
    clearInterval(beat);
  }
};

export const serve = async (die, next) => {
  const url = die.mask.statics.serve;
  die.aperture.open("/multiplex", shard.serve.multiplex(die.aperture, die.controller.stdout));
  const server = Deno.serve(
    { port: Number(url.port), hostname: url.hostname, signal: die.controller.abort.signal, onListen: ({ hostname, port }) => die.controller.stdout.log({ listen: { hostname, port } }) },
    shard.cors.wrap(shape.http(die.aperture)),
  );
  try {
    await next();
  } finally {
    await server.shutdown();
  }
};

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
    ["view", entities.view, null, {}],
    ["file", entities.file, null, {}],
  ];
  for (const [kind, repository, scope, reactive] of routes) {
    const branch = owned.branch(`/${kind}`);
    if (scope) branch.use(shard.datamap.scope(scope));
    branch.graft(shard.datamap.repository(repository)).graft(shard.datamap.reactive(repository, twitch, reactive));
  }
  owned.branch("/view").open("/bundle", async (ctx) => {
    const seated = await seat(die, ctx.input.data.mode);
    return entities.view.bundle(ctx.input.data, { bundler: paladin.bundler(new Path(seated.mountpoint).absolute) });
  });

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
  for (const name of v.primitives.controller.SIGNALS) {
    stdin.open(name, async (ctx) => {
      await ctx.activity.stdin[name](ctx.input.reason);
      return ctx.activity.controller.toJSON();
    });
  }

  await next();
};

const seat = async (die, id) => {
  for (const host of [die.runtime, ...Object.values(die.runtime.daemons)]) {
    const held = fromm.modes(host.modes).flat.find((mode) => mode.entity.id === id);
    if (held) return held;
  }
  throw new Error(`[view/bundle] no live mode holds entity ${id}`);
};

export const entities = async (die, next) => {
  die.runtime.aperture
    .branch("/entities/mode")
    .graft(shard.datamap.repository(die.runtime.datamap.entities.mode))
    .graft(shard.datamap.reactive(die.runtime.datamap.entities.mode, die.runtime.twitch));
  die.runtime.aperture
    .branch("/entities/daemon")
    .graft(shard.datamap.repository(die.runtime.entities.daemon))
    .graft(shard.datamap.reactive(die.runtime.entities.daemon, die.runtime.twitch));
  await next();
};

export const metadata = async (die, next) => {
  host.metadata(die.runtime);
  await next();
};

export const cortex = async (die, next) => {
  host.cortex(die.runtime);
  await next();
};
