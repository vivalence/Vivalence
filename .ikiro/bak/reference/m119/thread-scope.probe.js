import { MikroORM, RequestContext, wrap } from "@mikro-orm/core";
import { sets, BufferEntity, DaemonEntity, ModeEntity, ThreadEntity, TurnEntity, UserEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
for (const type of ["turn", "buffer"]) {
  assembled.entities.find((d) => d.type === type).schema.meta.filters.thread = { cond: (args) => ({ thread: args.thread }), default: false };
}

const orm = await MikroORM.init(config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }));
await orm.schema.create();
const em = orm.em;

orm.em.getEventManager().registerSubscriber({
  getSubscribedEntities: () => [TurnEntity, BufferEntity],
  beforeCreate(args) {
    if (args.entity.thread !== undefined) return;
    const params = args.em.getFilterParams("thread");
    if (!params) throw new Error(`stamp: ${args.meta.className} created with no thread in context`);
    args.entity.thread = args.em.getReference(ThreadEntity, params.thread);
  },
});

const source = (key, value) => (typeof value === "function" ? value.toString() : value);
console.log("== TurnEntity meta.filters");
console.log(JSON.stringify(orm.getMetadata().get("TurnEntity").filters, source, 2));

let seeded;
await RequestContext.create(em, async () => {
  const ctx = RequestContext.getEntityManager(em.name);
  ctx.setFilterParams("user", { user: null });
  const beef = ctx.create(UserEntity, { slug: "beef" });
  const daemon = ctx.create(DaemonEntity, { slug: "edu" });
  const italian = ctx.create(ModeEntity, { slug: "italian", type: "language", daemon });
  await ctx.flush();
  const a = ctx.create(ThreadEntity, { user: beef, mode: italian });
  const b = ctx.create(ThreadEntity, { user: beef, mode: italian });
  await ctx.flush();
  for (const [thread, text] of [[a, "ciao"], [a, "grazie"], [b, "e4"]]) {
    ctx.create(TurnEntity, { role: "user", parts: [{ text }], thread, mode: italian });
  }
  await ctx.flush();
  seeded = { user: beef.id, a: a.id, b: b.id };
});

const texts = (rows) => rows.map((t) => t.parts[0].text);
const enable = (ctx) => {
  const meta = orm.getMetadata().get("TurnEntity");
  ctx.addFilter({ ...meta.filters.thread, name: "thread", entity: ["TurnEntity", "BufferEntity"], default: true });
};
const read = (name, task) =>
  RequestContext.create(em, async () => {
    const ctx = RequestContext.getEntityManager(em.name);
    ctx.setFilterParams("user", { user: seeded.user });
    try {
      console.log(name, JSON.stringify(await task(ctx)));
    } catch (error) {
      console.log(name, "THREW", JSON.stringify(error.message));
    }
  });

await read("dormant: user bound, no thread, history({})            ", (ctx) => ctx.getRepository(TurnEntity).history({}).then(texts));
await read("enabled thread a: history({})                           ", (ctx) => {
  enable(ctx);
  ctx.setFilterParams("thread", { thread: seeded.a });
  return ctx.getRepository(TurnEntity).history({}).then(texts);
});
await read("enabled thread a: chain({ role, parts }) — no thread named", async (ctx) => {
  enable(ctx);
  ctx.setFilterParams("thread", { thread: seeded.a });
  const turn = await ctx.getRepository(TurnEntity).chain({ role: "assistant", parts: [{ text: "prego" }], mode: null });
  const pojo = wrap(turn).toPOJO();
  console.log(JSON.stringify({ ...pojo, parent: pojo.parent, thread: pojo.thread === seeded.a ? "<a>" : pojo.thread }, null, 2));
  return (await ctx.getRepository(TurnEntity).history({})).map((t) => `${t.parts[0].text}:${t.thread.id === seeded.a ? "a" : "b"}`);
});
await read("enabled, params FORGOTTEN: history({})                  ", (ctx) => {
  enable(ctx);
  return ctx.getRepository(TurnEntity).history({}).then(texts);
});
await read("enabled thread b: buffer.create({ mime }) — no thread   ", async (ctx) => {
  enable(ctx);
  ctx.setFilterParams("thread", { thread: seeded.b });
  const buffer = ctx.create(BufferEntity, { mime: "application/json" });
  await ctx.flush();
  return { thread: buffer.thread.id === seeded.b ? "b" : buffer.thread.id };
});

await orm.close();
