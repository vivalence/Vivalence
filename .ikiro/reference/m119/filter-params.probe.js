import { MikroORM, RequestContext } from "@mikro-orm/core";
import { Datamap } from "@vivalence/typology";
import { sets, DaemonEntity, LiteralEntity, ModeEntity, UserEntity, ThreadEntity, BufferEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const results = [];
const probe = async (name, fn) => {
  try {
    results.push([name, "ok", await fn()]);
  } catch (error) {
    results.push([name, "THREW", error.message.slice(0, 140)]);
  }
};

const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
const orm = await MikroORM.init(config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }));
await orm.schema.create();
const datamap = new Datamap(orm);
const em = orm.em;

const SCOPED = [LiteralEntity, ThreadEntity, BufferEntity];


orm.em.getEventManager().registerSubscriber({
  getSubscribedEntities: () => SCOPED,
  beforeCreate(args) {
    const params = args.em.getFilterParams("mode");
    if (args.entity.mode === undefined || args.entity.mode === null) {
      if (params) args.entity.mode = args.em.getReference(ModeEntity, params.mode);
    }
  },
});

const scope = (params, task) => RequestContext.create(em, async () => {
  const ctx = RequestContext.getEntityManager(em.name);
  for (const [name, value] of Object.entries(params)) ctx.setFilterParams(name, value);
  return task(ctx);
});

let seeded;
await scope({ user: { user: null }, mode: { mode: null } }, async (ctx) => {
  const user = ctx.create(UserEntity, { slug: "beef" });
  const daemon = ctx.create(DaemonEntity, { slug: "edu" });
  const italian = ctx.create(ModeEntity, { slug: "italian", type: "language", daemon });
  const chess = ctx.create(ModeEntity, { slug: "chess", type: "game", daemon });
  await ctx.flush();
  for (const [mode, slug] of [[italian, "ciao"], [italian, "grazie"], [chess, "e4"]]) {
    ctx.create(LiteralEntity, { slug, daemon, mode, literal: slug, mime: "text/plain", traits: [], trait: {} });
  }
  await ctx.flush();
  seeded = { user: user.id, italian: italian.id, chess: chess.id, daemon };
});

await probe("A raw em.find, no context, no params", () => em.find(LiteralEntity, {}));

await probe("A2 raw em.find, no context, filters:false", async () => (await em.find(LiteralEntity, {}, { filters: false })).length);

await probe("B em.find inside scope(mode=italian)", () =>
  scope({ mode: { mode: seeded.italian } }, async (ctx) => (await ctx.find(LiteralEntity, {})).map((l) => l.slug)),
);

await probe("B2 repository.find inside scope(mode=chess)", () =>
  scope({ mode: { mode: seeded.chess } }, async (ctx) => (await ctx.getRepository(LiteralEntity).find({})).map((l) => l.slug)),
);

await probe("C fork() inside scope inherits params", () =>
  scope({ mode: { mode: seeded.italian } }, async (ctx) => (await ctx.fork().find(LiteralEntity, {})).map((l) => l.slug)),
);

await probe("D filters:{mode:false} inside scope reads all", () =>
  scope({ mode: { mode: seeded.italian } }, async (ctx) => (await ctx.find(LiteralEntity, {}, { filters: { mode: false } })).length),
);

await probe("E beforeCreate stamps mode from params", () =>
  scope({ mode: { mode: seeded.chess } }, async (ctx) => {
    ctx.create(LiteralEntity, { slug: "d4", daemon: seeded.daemon });
    await ctx.flush();
    return (await ctx.find(LiteralEntity, {})).map((l) => l.slug);
  }),
);

await probe("E2 create with no mode and NO params throws at flush", () =>
  RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    ctx.create(LiteralEntity, { slug: "orphan", daemon: seeded.daemon });
    await ctx.flush();
    return "flushed";
  }),
);

await probe("F count inside scope", () => scope({ mode: { mode: seeded.italian } }, (ctx) => ctx.count(LiteralEntity, {})));

await probe("G nativeUpdate inside scope touches only own rows", () =>
  scope({ mode: { mode: seeded.italian } }, async (ctx) => {
    const touched = await ctx.nativeUpdate(LiteralEntity, {}, { ontology: "italian" });
    const all = await em.find(LiteralEntity, {}, { filters: false });
    return { touched, mimes: all.map((l) => `${l.slug}:${l.ontology}`) };
  }),
);

await probe("H two scopes interleaved keep their own params", async () => {
  const [a, b] = await Promise.all([
    scope({ mode: { mode: seeded.italian } }, async (ctx) => {
      await new Promise((r) => setTimeout(r, 5));
      return (await ctx.find(LiteralEntity, {})).map((l) => l.slug);
    }),
    scope({ mode: { mode: seeded.chess } }, async (ctx) => (await ctx.find(LiteralEntity, {})).map((l) => l.slug)),
  ]);
  return { a, b };
});

await probe("I async generator made inside scope, pulled OUTSIDE", async () => {
  const gen = await scope({ mode: { mode: seeded.italian } }, async (ctx) => {
    return (async function* () {
      yield (await ctx.find(LiteralEntity, {})).map((l) => l.slug);
    })();
  });
  return (await gen.next()).value;
});

await probe("I2 same, but the generator asks the GLOBAL em (RequestContext resolution)", async () => {
  const gen = await scope({ mode: { mode: seeded.italian } }, async () => {
    return (async function* () {
      yield (await em.find(LiteralEntity, {})).map((l) => l.slug);
    })();
  });
  return (await gen.next()).value;
});

await probe("I3 same, carried with datamap.shard.carry()", async () => {
  const gen = await scope({ mode: { mode: seeded.italian } }, async () => {
    const within = datamap.shard.carry();
    return (async function* () {
      yield await within(async () => (await em.find(LiteralEntity, {})).map((l) => l.slug));
    })();
  });
  return (await gen.next()).value;
});

await probe("J datamap.shard.bind middleware sets params on the context em", () =>
  RequestContext.create(em, async () => {
    await datamap.shard.bind("mode", () => ({ mode: seeded.chess }))({}, async () => {});
    return (await em.find(LiteralEntity, {})).map((l) => l.slug);
  }),
);

await probe("K user filter (default:true on Thread) + mode filter both on", () =>
  scope({ user: { user: seeded.user }, mode: { mode: seeded.italian } }, async (ctx) => {
    ctx.create(ThreadEntity, { user: seeded.user, mode: seeded.italian });
    ctx.create(ThreadEntity, { user: seeded.user, mode: seeded.chess });
    await ctx.flush();
    return (await ctx.find(ThreadEntity, {})).length;
  }),
);

await probe("K2 Thread read with mode params but NO user params", () =>
  scope({ mode: { mode: seeded.italian } }, async (ctx) => (await ctx.find(ThreadEntity, {})).length),
);

await probe("L populate across a fenced relation: Mode.literals from a chess scope", () =>
  scope({ mode: { mode: seeded.chess } }, async (ctx) => {
    const italian = await ctx.findOneOrFail(ModeEntity, { id: seeded.italian }, { populate: ["literals"] });
    return italian.literals.getItems().map((l) => l.slug);
  }),
);


await probe("M fork() of the GLOBAL em, outside any context, then find", async () => (await em.fork().find(LiteralEntity, {})).map((l) => l.slug));

await probe("M2 same fork, filters:false", async () => (await em.fork().find(LiteralEntity, {}, { filters: false })).length);

await probe("M3 fork taken INSIDE scope(italian), pulled outside the scope", async () => {
  const fork = await scope({ mode: { mode: seeded.italian } }, async (ctx) => ctx.fork());
  return (await fork.find(LiteralEntity, {})).map((l) => l.slug);
});

await probe("N getReference + populate of a sibling mode's literals, no mode params", () =>
  RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    const italian = await ctx.findOneOrFail(ModeEntity, { id: seeded.italian }, { populate: ["literals"] });
    return italian.literals.getItems().map((l) => l.slug);
  }),
);


const enable = (ctx, name, cond, entity) => ctx.addFilter({ name, cond, entity, default: true });
const MODE = (args) => ({ mode: args.mode });
const DAEMON = (args) => ({ daemon: args.daemon });

await probe("P1 context A: addFilter(mode) + params → fenced", () =>
  RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    enable(ctx, "mode", MODE, SCOPED);
    ctx.setFilterParams("mode", { mode: seeded.italian });
    return (await ctx.find(LiteralEntity, {})).map((l) => l.slug);
  }),
);

await probe("P2 context B, no addFilter: daemon-wide read, no throw", () =>
  RequestContext.create(em, async () => (await RequestContext.getEntityManager(em.name).find(LiteralEntity, {})).map((l) => l.slug)),
);

await probe("P3 entity-declared daemon filter (default:false) ENABLED in a context by addFilter of the same name", () =>
  RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    enable(ctx, "daemon", DAEMON, [LiteralEntity]);
    ctx.setFilterParams("daemon", { daemon: seeded.daemon.id });
    const mine = (await ctx.find(LiteralEntity, {})).length;
    ctx.setFilterParams("daemon", { daemon: "nobody" });
    const none = (await ctx.find(LiteralEntity, {})).length;
    return { mine, none };
  }),
);

await probe("P4 after P3, a fresh context still reads daemon-wide (no leak to the global em)", () =>
  RequestContext.create(em, async () => (await RequestContext.getEntityManager(em.name).find(LiteralEntity, {})).length),
);

await probe("P5 fork of an enabled context carries the filter AND params", () =>
  RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    enable(ctx, "mode", MODE, SCOPED);
    ctx.setFilterParams("mode", { mode: seeded.chess });
    return (await ctx.fork().find(LiteralEntity, {})).map((l) => l.slug);
  }),
);

await probe("P6 enabled context, params FORGOTTEN → throws, not silent", () =>
  RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    enable(ctx, "mode", MODE, SCOPED);
    return (await ctx.find(LiteralEntity, {})).length;
  }),
);

await probe("P7 nested: daemon enabled, then mode enabled in a fork → both bite", () =>
  RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    enable(ctx, "daemon", DAEMON, [LiteralEntity]);
    ctx.setFilterParams("daemon", { daemon: seeded.daemon.id });
    return RequestContext.create(ctx, async () => {
      const inner = RequestContext.getEntityManager(em.name);
      enable(inner, "mode", MODE, SCOPED);
      inner.setFilterParams("mode", { mode: seeded.chess });
      return (await inner.find(LiteralEntity, {})).map((l) => l.slug);
    });
  }),
);

await orm.close();
for (const [name, status, value] of results) console.log(`${status.padEnd(6)} ${name}\n       ${JSON.stringify(value)}`);
