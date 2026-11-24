import { MikroORM, RequestContext, wrap } from "@mikro-orm/core";
import { sets, BufferEntity, DaemonEntity, ModeEntity, ThreadEntity, TurnEntity, UserEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);

const arm = async (label) => {
  const orm = await MikroORM.init(config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }));
  await orm.schema.create();
  const em = orm.em;
  const rule = (name) => orm.getMetadata().get(name).properties.mode.deleteRule;
  console.log(`== ${label} · deleteRule thread=${rule("ThreadEntity")} turn=${rule("TurnEntity")} buffer=${rule("BufferEntity")}`);
  await RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    ctx.setFilterParams("user", { user: null });
    const beef = ctx.create(UserEntity, { slug: "beef" });
    const daemon = ctx.create(DaemonEntity, { slug: "edu" });
    const italian = ctx.create(ModeEntity, { slug: "italian", type: "language", daemon });
    await ctx.flush();
    const thread = ctx.create(ThreadEntity, { user: beef, mode: italian });
    await ctx.flush();
    ctx.create(TurnEntity, { role: "user", parts: [{ text: "ciao" }], thread, mode: italian });
    ctx.create(BufferEntity, { mime: "application/json", thread, mode: italian });
    await ctx.flush();
    ctx.setFilterParams("user", { user: beef.id });
    const count = async () => ({ threads: await ctx.count(ThreadEntity, {}), turns: await ctx.count(TurnEntity, {}), buffers: await ctx.count(BufferEntity, {}) });
    console.log("before prune  ", JSON.stringify(await count()));
    ctx.remove(italian);
    await ctx.flush();
    ctx.clear();
    console.log("mode pruned   ", JSON.stringify(await count()));
    const turn = await ctx.findOne(TurnEntity, {});
    if (turn) console.log(JSON.stringify(wrap(turn).toPOJO(), null, 2));
  });
  await orm.close();
};

await arm("A · the tree today");
for (const type of ["thread", "turn", "buffer"]) assembled.entities.find((d) => d.type === type).schema.meta.properties.mode.deleteRule = "set null";
const modeBuffers = assembled.entities.find((d) => d.type === "mode").schema.meta.properties.buffers;
modeBuffers.cascade = [];
modeBuffers.orphanRemoval = false;
await arm("B · deleteRule: set null · Mode.buffers no Cascade.REMOVE");
