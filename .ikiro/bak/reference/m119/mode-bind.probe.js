import { MikroORM } from "@mikro-orm/core";
import { Aperture, Datamap, shape, shard } from "@vivalence/typology";
import { sets, DaemonEntity, LiteralEntity, ModeEntity, ThreadEntity, TurnEntity, UserEntity } from "@vivalence/runtime";
import { assemble } from "/Users/finn/vivalence/code/vivalence/systems/runtime/gestalten/belt/assemble.js";
import { config } from "/Users/finn/vivalence/code/vivalence/commons/datamaps/libsql/libsql.viva.js";

const ROW = (name) => ({ cond: (args) => (args?.[name] ? { [name]: args[name] } : {}), default: true, args: false });
const assembled = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
const schema = (type) => assembled.entities.find((d) => d.type === type).schema.meta;
for (const type of ["literal", "symbol", "note", "mode"]) schema(type).filters.daemon = ROW("daemon");
for (const type of ["literal", "symbol", "view", "intent", "file", "note", "thread", "turn", "buffer"]) schema(type).filters.mode = ROW("mode");

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
  const chess = em.create(ModeEntity, { slug: "chess", type: "game", daemon: edu });
  await em.flush();
  for (const [mode, slug] of [[italian, "ciao"], [italian, "grazie"], [chess, "e4"]]) {
    em.create(LiteralEntity, { slug, daemon: edu, mode, literal: slug, mime: "text/plain", traits: [], trait: {} });
  }
  const a = em.create(ThreadEntity, { user: beef, mode: italian });
  const b = em.create(ThreadEntity, { user: beef, mode: chess });
  await em.flush();
  em.create(TurnEntity, { role: "user", parts: [{ text: "ciao" }], thread: a, mode: italian });
  em.create(TurnEntity, { role: "user", parts: [{ text: "e4" }], thread: b, mode: chess });
  await em.flush();
  seeded = { user: beef.id, italian: italian.id, chess: chess.id };
});

const daemon = new Aperture()
  .use(shard.datamap.inject(datamap))
  .use(datamap.shard.bind("daemon", () => ({ daemon: "edu" })))
  .use(async (ctx, next) => { ctx.user = { id: seeded.user }; await next(); })
  .use(datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })));
for (const kind of ["literal", "mode"]) daemon.branch(`/entities/${kind}`).graft(shard.datamap.repository(datamap.entities[kind]));

const mode = (slug, id) => {
  const aperture = new Aperture()
    .use(async (ctx, next) => { ctx.mode = { id }; await next(); })
    .use(datamap.shard.bind("mode", (ctx) => ({ mode: ctx.mode.id })));
  for (const kind of ["literal", "symbol", "view", "intent", "file", "note", "thread", "turn", "buffer"]) {
    aperture.branch(`/entities/${kind}`).graft(shard.datamap.repository(datamap.entities[kind]));
  }
  daemon.branch(`/mode/${slug}`).graft(aperture);
};
mode("language/italian", seeded.italian);
mode("game/chess", seeded.chess);
const serve = shape.http(daemon);

const post = async (path, body = {}) => (await serve(new Request(`http://probe${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }))).json();
const slugs = (rows) => rows.map((row) => row.slug);

console.log("/entities/literal/find {}                         ", JSON.stringify(slugs(await post("/entities/literal/find"))));
console.log("/mode/language/italian/entities/literal/find {}   ", JSON.stringify(slugs(await post("/mode/language/italian/entities/literal/find"))));
console.log("/mode/game/chess/entities/literal/find {}         ", JSON.stringify(slugs(await post("/mode/game/chess/entities/literal/find"))));
console.log("/mode/language/italian/entities/turn/find {}      ", JSON.stringify((await post("/mode/language/italian/entities/turn/find")).map((t) => t.parts[0].text)));
console.log("/mode/language/italian/entities/thread/count {}   ", JSON.stringify(await post("/mode/language/italian/entities/thread/count")));
console.log("/mode/language/italian/entities/literal/find {mode: chess}", JSON.stringify(await post("/mode/language/italian/entities/literal/find", { where: { mode: seeded.chess } })));
console.log("/entities/mode/find {}                            ", JSON.stringify(slugs(await post("/entities/mode/find"))));
await orm.close();
