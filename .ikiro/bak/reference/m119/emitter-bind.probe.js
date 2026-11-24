import { MikroORM, wrap } from "@mikro-orm/core";
import { Datamap, Vector, steer } from "@vivalence/typology";
import { sets, BufferEntity, DaemonEntity, ModeEntity, ThreadEntity, UserEntity } from "@vivalence/runtime";
const root = Deno.args[0];
const { assemble } = await import(`${root}/systems/runtime/gestalten/belt/assemble.js`);
const { config } = await import(`${root}/commons/datamaps/libsql/libsql.viva.js`);
const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
const orm = await MikroORM.init(config({}, { entities: assembled.entities.map((d) => d.schema), dbName: ":memory:" }));
await orm.schema.create();
const datamap = new Datamap(orm);
const em = datamap.entities.em;
let seeded;
await datamap.shard.scope(async () => {
  em.setFilterParams("user", { user: null });
  const beef = em.create(UserEntity, { slug: "beef" });
  const edu = em.create(DaemonEntity, { slug: "edu" });
  await em.flush();
  const italian = em.create(ModeEntity, { slug: "italian", type: "language", daemon: edu });
  await em.flush();
  const a = em.create(ThreadEntity, { user: beef, mode: italian });
  const b = em.create(ThreadEntity, { user: beef, mode: italian });
  await em.flush();
  em.create(BufferEntity, { mime: "text/plain", thread: a, mode: italian, data: { text: "ciao, thread a" } });
  em.create(BufferEntity, { mime: "text/plain", thread: b, mode: italian, data: { text: "e4, thread b" } });
  await em.flush();
  seeded = { user: beef.id, a: a.id, b: b.id };
});
const context = { datamap, entities: datamap.entities };
const emitter = new Vector();
emitter.use(async (ctx, next) => {
  ctx.thread = await context.entities.thread.findOneOrFail({ id: ctx.input.thread });
  await next();
});
emitter.use(context.datamap.shard.bind("thread", (ctx) => ({ thread: ctx.thread.id })));
emitter.open("/emit/draw", async (ctx) => (await context.entities.buffer.find({})).map((buffer) => wrap(buffer).toPOJO()));
for (const thread of [seeded.a, seeded.b]) {
  const seen = await datamap.shard.scope(async () => {
    em.setFilterParams("user", { user: seeded.user });
    const ctx = { input: { thread } };
    await steer.dispatch.execute(emitter, ctx, "/emit/draw");
    return ctx.output;
  });
  console.log(`thread ${thread === seeded.a ? "a" : "b"} → /emit/draw → buffer.find({})`);
  console.log(JSON.stringify(seen, null, 2));
}
await orm.close();
