import { MikroORM, wrap } from "@mikro-orm/core";
import { Datamap, Twitch, shard } from "@vivalence/typology";
import { sets, DaemonEntity, LiteralEntity, ModeEntity, UserEntity, ThreadEntity, TurnEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const ROW = (name) => ({ cond: (args) => (args?.[name] ? { [name]: args[name] } : {}), default: true, args: false });
const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
for (const type of ["literal", "turn"]) assembled.entities.find((d) => d.type === type).schema.meta.filters.mode = ROW("mode");
assembled.entities.find((d) => d.type === "turn").schema.meta.filters.thread = ROW("thread");
for (const type of ["literal", "mode"]) assembled.entities.find((d) => d.type === type).schema.meta.filters.daemon = ROW("daemon");

export function stamped(...names) {
  return async (ctx) => {
    const { meta, entity, em } = ctx.input;
    for (const name of names) {
      if (!meta.properties[name] || entity[name] !== undefined) continue;
      const params = em.getFilterParams(name);
      if (!params) throw new Error(`[datamap] ${meta.className} created with no ${name} in context`);
      entity[name] = params[name] === null ? null : em.getReference(meta.properties[name].targetMeta.class, params[name]);
    }
  };
}

const arm = async (label, mount) => {
  const orm = await MikroORM.init(config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }));
  await orm.schema.create();
  const datamap = new Datamap(orm);
  const em = datamap.entities.em;
  const twitch = new Twitch();
  mount(twitch);
  datamap.registerSubscriber(twitch);
  console.log(`== ${label}`);

  let seeded;
  await datamap.shard.scope(async () => {
    em.setFilterParams("user", { user: null });
    em.setFilterParams("daemon", { daemon: null });
    const beef = em.create(UserEntity, { slug: "beef" });
    const daemon = em.create(DaemonEntity, { slug: "edu" });
    await em.flush();
    const italian = em.create(ModeEntity, { slug: "italian", type: "language", daemon });
    await em.flush();
    const thread = em.create(ThreadEntity, { user: beef, mode: italian });
    await em.flush();
    seeded = { italian: italian.id, daemon: daemon.id, thread: thread.id, user: beef.id };
  });

  const probe = async (name, fn) => {
    try {
      console.log(name, JSON.stringify(await fn()));
    } catch (error) {
      console.log(name, "THREW", JSON.stringify(error.message));
    }
  };

  await probe("create literal, daemon+mode params, no columns named ", () =>
    datamap.shard.scope(async () => {
      em.setFilterParams("user", { user: seeded.user });
      em.setFilterParams("daemon", { daemon: "edu" });
      em.setFilterParams("mode", { mode: seeded.italian });
      const literal = em.create(LiteralEntity, { slug: "ciao", literal: "ciao", mime: "text/plain", traits: [], trait: {} });
      await em.flush();
      const pojo = wrap(literal).toPOJO();
      return { daemon: pojo.daemon, mode: pojo.mode === seeded.italian ? "<italian>" : pojo.mode };
    }));
  await probe("create turn, mode+thread params                       ", () =>
    datamap.shard.scope(async () => {
      em.setFilterParams("user", { user: seeded.user });
      em.setFilterParams("mode", { mode: seeded.italian });
      em.setFilterParams("thread", { thread: seeded.thread });
      const turn = em.create(TurnEntity, { role: "user", parts: [{ text: "ciao" }] });
      await em.flush();
      const pojo = wrap(turn).toPOJO();
      return { thread: pojo.thread === seeded.thread ? "<thread>" : pojo.thread, mode: pojo.mode === seeded.italian ? "<italian>" : pojo.mode };
    }));
  await probe("create literal, NO params                              ", () =>
    datamap.shard.scope(async () => {
      em.setFilterParams("user", { user: seeded.user });
      em.create(LiteralEntity, { slug: "orphan", literal: "orphan", mime: "text/plain", traits: [], trait: {} });
      await em.flush();
      return "flushed";
    }));
  await probe("create literal, daemon named in data, mode params     ", () =>
    datamap.shard.scope(async () => {
      em.setFilterParams("user", { user: seeded.user });
      em.setFilterParams("mode", { mode: seeded.italian });
      const literal = em.create(LiteralEntity, { slug: "grazie", literal: "grazie", mime: "text/plain", traits: [], trait: {}, daemon: "edu" });
      await em.flush();
      return { daemon: wrap(literal).toPOJO().daemon };
    }));
  await probe("create mode at runtime: daemon params null → null     ", () =>
    datamap.shard.scope(async () => {
      em.setFilterParams("user", { user: seeded.user });
      em.setFilterParams("daemon", { daemon: null });
      const mode = em.create(ModeEntity, { slug: "shell", type: "console" });
      await em.flush();
      return { daemon: wrap(mode).toPOJO().daemon };
    }));
  await probe("update a literal: stamp does not run                   ", () =>
    datamap.shard.scope(async () => {
      em.setFilterParams("user", { user: seeded.user });
      await em.nativeUpdate(LiteralEntity, { slug: "ciao" }, { ontology: "x" });
      const literal = await em.findOneOrFail(LiteralEntity, { slug: "ciao" });
      literal.ontology = "y";
      await em.flush();
      return "flushed";
    }));
  await orm.close();
};

await arm("use on /before (the quest's mount)", (twitch) => twitch.branch("/before").use(stamped("daemon", "mode", "thread")));
await arm("open /before/*/create", (twitch) => twitch.open("/before/*/create", stamped("daemon", "mode", "thread")));
await arm("open /before/*/create UNDER a daemon twitch's owned() gate", (twitch) =>
  twitch
    .use(async (ctx, next) => { ctx.reference = { absolute: "/daemon/edu" }; await next(); })
    .use(shard.datamap.owned())
    .open("/before/*/create", stamped("daemon", "mode", "thread")));
